// Cotizador: código puro, sin IA.
export const IVA = 0.16;
export const PLAZO_PCT = { 12: 0, 24: 5, 36: 10 };
const LICENCIAS = ['SIM-M365-01', 'SIM-M365-02', 'SIM-M365-03', 'SIM-M365-04', 'SIM-M365-05'];
const BASE_M365 = ['SIM-M365-01', 'SIM-M365-02', 'SIM-M365-03', 'SIM-M365-04'];

export const esConsumo = (p) => p.unidad_cobro === 'según consumo';
export const esUnicoPorUnidad = (p) => p.unidad_cobro.startsWith('cargo único');
export const esMedida = (p) => p.tipo === 'a la medida';
export const tieneCantidad = (p) => !esMedida(p) && !esConsumo(p) && !p.unidad_cobro.startsWith('%') && p.unidad_cobro !== 'por proyecto';

export function cantidadInicial(p, datos = {}) {
  const min = p.cantidad_minima || 1;
  const u = p.unidad_cobro;
  let q = 1;
  if (/usuario|buzón/.test(u) && datos.usuarios > 0) q = datos.usuarios;
  else if (/TB/.test(u) && datos.tb > 0) q = Math.ceil(datos.tb);
  else if (/servidor/.test(u) && datos.servidores > 0) q = datos.servidores;
  return clamp(p, Math.max(q, min));
}

export function clamp(p, q) {
  let v = Math.max(Number(q) || 0, p.cantidad_minima || 1);
  if (p.cantidad_maxima) v = Math.min(v, p.cantidad_maxima);
  return Math.round(v);
}

export function paquetesAplicados(lineas, paquetes) {
  const s = new Set(lineas.map((l) => l.sku));
  return paquetes.filter((q) => q.productos.length && q.productos.every((x) => s.has(x)));
}

export function calcular({ lineas, plazo, productosMap, paquetes, paqueteCuentaEnLimite = true }) {
  const plazoPct = PLAZO_PCT[plazo] || 0;
  const paqs = paquetesAplicados(lineas, paquetes);
  const usuariosM365 = lineas.filter((l) => BASE_M365.includes(l.sku)).reduce((a, l) => a + (l.cantidad || 0), 0);
  const volumen = usuariosM365 >= 100;
  const t = { subtotal: 0, descPlazo: 0, descPaquete: 0, descVolumen: 0, unicos: 0 };

  const filas = lineas.map((l) => {
    const p = productosMap[l.sku];
    const f = { sku: l.sku, nombre: p.nombre, unidad: p.unidad_cobro, tipo: p.tipo, cantidad: l.cantidad, precioUnit: null, cargoUnit: null, mensual: 0, unico: 0, estimado: false, medida: false, descPct: 0 };
    if (esMedida(p)) { f.medida = true; return f; }
    if (esConsumo(p)) { f.mensual = Number(l.consumo) || 0; f.estimado = true; f.cantidad = null; }
    else if (esUnicoPorUnidad(p)) { f.cargoUnit = p.cargo_unico_mxn || 0; f.unico = f.cargoUnit * l.cantidad; }
    else {
      const q = tieneCantidad(p) ? l.cantidad : 1;
      f.cantidad = q;
      f.precioUnit = p.precio_mensual_mxn || 0;
      f.mensual = f.precioUnit * q;
      f.cargoUnit = p.cargo_unico_mxn || 0;
      f.unico = f.cargoUnit;
    }
    const paq = paqs.find((q) => q.productos.includes(l.sku));
    const paqPct = paq ? paq.descuento_pct : 0;
    const volPct = volumen && LICENCIAS.includes(l.sku) ? 3 : 0;
    f.paquete = paq?.id_paquete || null;
    f.descPct = plazoPct + paqPct + volPct;
    t.subtotal += f.mensual;
    t.descPlazo += (f.mensual * plazoPct) / 100;
    t.descPaquete += (f.mensual * paqPct) / 100;
    t.descVolumen += (f.mensual * volPct) / 100;
    t.unicos += f.unico;
    return f;
  });

  const descuentos = t.descPlazo + t.descPaquete + t.descVolumen;
  const neto = t.subtotal - descuentos;
  const iva = neto * IVA;
  const contable = paqueteCuentaEnLimite ? descuentos : descuentos - t.descPaquete;
  const pctTotal = t.subtotal ? (contable / t.subtotal) * 100 : 0;
  return {
    filas, paquetes: paqs, ...t, descuentos, neto, iva, totalMensual: neto + iva,
    ivaUnicos: t.unicos * IVA, totalUnicos: t.unicos * (1 + IVA),
    pctTotal, requiereAutorizacion: pctTotal > 10 + 1e-9, plazoPct, volumen
  };
}

export function faltantes(lineas, productosMap) {
  const s = new Set(lineas.map((l) => l.sku));
  return lineas
    .map((l) => productosMap[l.sku])
    .filter((p) => p.requiere_alguno_de?.length && !p.requiere_alguno_de.some((x) => s.has(x)))
    .map((p) => ({ producto: p, opciones: p.requiere_alguno_de.map((x) => productosMap[x]).filter(Boolean) }));
}

export function recomendados(lineas, productosMap) {
  const s = new Set(lineas.map((l) => l.sku));
  const out = new Set();
  lineas.forEach((l) => (productosMap[l.sku]?.se_recomienda_con || []).forEach((x) => !s.has(x) && productosMap[x] && out.add(x)));
  return [...out].map((x) => productosMap[x]);
}

// Verifica cada SKU y precio contra el catálogo recién leído.
export function verificarPrecios(filas, catalogoFresco) {
  const m = Object.fromEntries(catalogoFresco.map((p) => [p.sku, p]));
  return filas.filter((f) => {
    const p = m[f.sku];
    if (!p) return true;
    if (f.precioUnit !== null && f.precioUnit !== (p.precio_mensual_mxn || 0)) return true;
    if (f.cargoUnit !== null && f.cargoUnit !== (p.cargo_unico_mxn || 0)) return true;
    return false;
  });
}

export const mxn = (v) => '$' + (Number(v) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });