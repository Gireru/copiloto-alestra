// Motor de precios determinista. Lee todo del catálogo; nada hardcodeado salvo la política comercial.
export const IVA = 0.16;
export const PLAZO_PCT = { 12: 0, 24: 5, 36: 10 };
export const LIMITE_DESC = 10;
const M365_BASE = ['SIM-M365-01', 'SIM-M365-02', 'SIM-M365-03', 'SIM-M365-04'];
const M365_LIC = [...M365_BASE, 'SIM-M365-05'];
const r2 = (v) => Math.round(v * 100) / 100;

export function versionCatalogo(productos) {
  const s = productos.map((p) => `${p.sku}:${p.precio_mensual_mxn}:${p.cargo_unico_mxn}`).sort().join('|');
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const fecha = productos.reduce((m, p) => (p.updated_date > m ? p.updated_date : m), '');
  return { version: `v${h.toString(36).toUpperCase().slice(0, 6)}`, fecha };
}

// Agrega requisitos faltantes (requiere_alguno_de) como líneas "requisito".
export function completarRequisitos(lineas, map) {
  const out = [...lineas];
  const errores = [];
  for (let i = 0; i < out.length; i++) {
    const p = map[out[i].sku];
    const req = p?.requiere_alguno_de || [];
    if (!req.length || req.some((s) => out.some((l) => l.sku === s))) continue;
    const opcion = req.find((s) => map[s]);
    if (!opcion) { errores.push(`${p.nombre} requiere ${req.join(' o ')}, que no está en el catálogo.`); continue; }
    out.push({ sku: opcion, cantidad: out[i].cantidad, origen: 'requisito', requerido_por: p.sku });
  }
  return { lineas: out, errores };
}

export function cotizar({ lineas, map, paquete, plazo, extraPct }) {
  const plazoPct = PLAZO_PCT[plazo] ?? 0;
  const paqSkus = new Set(paquete?.productos || []);
  const paqPct = paquete?.descuento_pct || 0;
  const usuariosM365 = lineas.filter((l) => M365_BASE.includes(l.sku)).reduce((a, l) => a + (Number(l.cantidad) || 0), 0);
  let requiereMedida = false;
  const t = { subtotal: 0, plazo: 0, paquete: 0, volumen: 0, vendedor: 0, unicos: 0 };

  const filas = lineas.map((l) => {
    const p = map[l.sku];
    const f = { sku: p.sku, nombre: p.nombre, unidad: p.unidad_cobro, origen: l.origen || 'confirmado', cantidad: null, precio_unitario: null, mensual: 0, cargo_unico: 0, descuentos: { plazo: 0, paquete: 0, volumen: 0, vendedor: 0 }, mensual_neto: 0, nota: '' };
    if (p.tipo === 'a la medida') { requiereMedida = true; f.nota = 'Lo define un arquitecto de soluciones'; return f; }
    const u = p.unidad_cobro || '';
    if (u === 'según consumo') {
      const est = Number(l.consumo_estimado) || 0;
      if (!est) { f.nota = 'Se cotiza con el consumo real del cliente'; return f; }
      f.mensual = est; f.nota = 'Consumo estimado';
    } else if (u.startsWith('cargo único')) {
      f.cantidad = Math.max(Number(l.cantidad) || 1, p.cantidad_minima || 1);
      f.precio_unitario = p.cargo_unico_mxn || 0;
      f.cargo_unico = f.precio_unitario * f.cantidad;
    } else {
      const porUnidad = /^por (usuario|TB|servidor|equipo)/.test(u);
      let q = porUnidad ? Math.max(Number(l.cantidad) || 1, p.cantidad_minima || 1) : 1;
      if (p.cantidad_maxima) q = Math.min(q, p.cantidad_maxima);
      f.cantidad = q;
      f.precio_unitario = p.precio_mensual_mxn || 0;
      f.mensual = f.precio_unitario * q;
      f.cargo_unico = p.cargo_unico_mxn || 0;
    }
    const d = f.descuentos;
    d.plazo = (f.mensual * plazoPct) / 100;
    d.paquete = paqSkus.has(p.sku) ? (f.mensual * paqPct) / 100 : 0;
    d.volumen = usuariosM365 >= 100 && M365_LIC.includes(p.sku) ? (f.mensual * 3) / 100 : 0;
    d.vendedor = (f.mensual * extraPct) / 100;
    Object.keys(d).forEach((k) => { d[k] = r2(d[k]); t[k] += d[k]; });
    f.mensual_neto = r2(f.mensual - d.plazo - d.paquete - d.volumen - d.vendedor);
    t.subtotal += f.mensual; t.unicos += f.cargo_unico;
    return f;
  });

  const descuentos = r2(t.plazo + t.paquete + t.volumen + t.vendedor);
  const subtotal = r2(t.subtotal);
  const neto = r2(subtotal - descuentos);
  const iva = r2(neto * IVA);
  const pct = subtotal ? r2((descuentos / subtotal) * 100) : 0;
  const excede = pct > LIMITE_DESC + 1e-9;
  const mensajes = [];
  if (excede) mensajes.push(`Descuento total del ${pct}% excede el 10%: requiere autorización del gerente.`);
  if (requiereMedida) mensajes.push('Incluye productos a la medida: requiere un arquitecto de soluciones.');
  return {
    lineas: filas, subtotal_mensual: subtotal,
    desglose_descuentos: { plazo: r2(t.plazo), paquete: r2(t.paquete), volumen: r2(t.volumen), vendedor: r2(t.vendedor) },
    descuentos, descuento_total_pct: pct, subtotal_con_descuento: neto, iva, total_mensual: r2(neto + iva),
    cargos_unicos: r2(t.unicos), cargos_unicos_total: r2(t.unicos * (1 + IVA)),
    nota_cargos_unicos: t.unicos ? 'Los cargos únicos no llevan descuento por plazo y se pueden pagar en 3 mensualidades.' : '',
    requiere_autorizacion: excede || requiereMedida, mensajes
  };
}