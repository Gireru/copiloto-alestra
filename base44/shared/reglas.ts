// Clasificador determinista: 10 reglas de escalamiento + marcador de autorización. Sin IA.
const NUBES = ['AWS', 'AZ', 'OCI'];
const MIGRACION = ['SIM-DC-09', 'SIM-AWS-05', 'SIM-AZ-04', 'SIM-OCI-03'];
const A_LA_MEDIDA = ['ESC-01', 'ESC-02', 'ESC-08', 'ESC-09', 'ESC-10'];
const n = (v) => (typeof v === 'number' && v > 0 ? v : null);

export function clasificar(datos = {}, skusCandidatos = [], productosMap = {}, texto = '', empleados = null) {
  const prods = skusCandidatos.map((s) => productosMap[s]).filter(Boolean);
  const fams = new Set(prods.map((p) => p.familia));
  const nubes = NUBES.filter((f) => fams.has(f));
  const skus = new Set(prods.map((p) => p.sku));
  const reg = String(datos.regulacion || '');
  const out = [];
  const add = (id, motivo, afecta) => out.push({ id, motivo, afecta });

  const medida = prods.filter((p) => p.tipo === 'a la medida');
  if (medida.length) add('ESC-01', `producto a la medida (${medida.map((p) => p.nombre).join(', ')})`, (p) => p.tipo === 'a la medida');

  const m365 = fams.has('M365');
  const mezcla = /licencias\s+(de\s+varios\s+tipos|mezcladas|revueltas|distintas|diferentes)/i.test(texto);
  const gente = n(datos.usuarios) > 300 ? datos.usuarios : n(empleados) > 300 ? empleados : null;
  if ((gente && m365) || mezcla)
    add('ESC-02', mezcla ? 'el cliente tiene licencias de varios tipos' : `${gente} usuarios en Microsoft 365`, (p) => p.familia === 'M365');

  const mig = n(datos.migracion_servidores) || (MIGRACION.some((s) => skus.has(s)) ? n(datos.servidores) : null);
  if (mig > 10) add('ESC-03', `migración de ${mig} servidores`, (p) => MIGRACION.includes(p.sku) || p.familia === 'DC');

  const m = [];
  if (datos.datos_salud === true || /salud|cl[ií]nic/i.test(reg)) m.push('datos de salud');
  if (/cnbv/i.test(reg)) m.push('regulación CNBV');
  if (/tarjeta|pci/i.test(reg)) m.push('pagos con tarjeta');
  if (/sensible/i.test(reg)) m.push('datos personales sensibles');
  if (!m.length && /expediente(s)?\s+cl[ií]nico|hospital|pacientes/i.test(texto)) m.push('datos de salud');
  if (m.length) add('ESC-04', m.join(', '), null);

  if (datos.integracion_sistemas === true || /\bERP\b|\bCRM\b|sistema\s+(interno|propio)/i.test(texto))
    add('ESC-05', 'integración con sistemas internos (ERP/CRM/propios)', (p) => ['IA', 'OCI', 'DC', 'AWS', 'AZ'].includes(p.familia));

  if (datos.multinube === true || nubes.length >= 2 || (nubes.length >= 1 && fams.has('DC')))
    add('ESC-06', nubes.length >= 2 ? 'combina dos o más nubes' : 'solución híbrida (nube + data center)', (p) => ['DC', 'BK', ...NUBES].includes(p.familia));

  const sla = [];
  if (n(datos.rpo_min) !== null && datos.rpo_min < 15) sla.push(`RPO de ${datos.rpo_min} min`);
  if (n(datos.rto_horas) !== null && datos.rto_horas < 4) sla.push(`RTO de ${datos.rto_horas} h`);
  if (n(datos.disponibilidad_pct) > 99.95) sla.push(`disponibilidad de ${datos.disponibilidad_pct}%`);
  if (sla.length) add('ESC-07', sla.join(', '), (p) => ['DC', 'BK'].includes(p.familia));

  if (n(datos.oracle_tb) > 2 || datos.oracle_rac_dataguard === true || /\bRAC\b|data ?guard/i.test(texto))
    add('ESC-08', n(datos.oracle_tb) > 2 ? `Oracle de ${datos.oracle_tb} TB` : 'Oracle con RAC / Data Guard', (p) => p.familia === 'OCI');

  if (n(datos.presupuesto_mensual) > 250000) add('ESC-09', `presupuesto de $${datos.presupuesto_mensual.toLocaleString('es-MX')} MXN/mes`, null);
  if (datos.pide_diseno_formal === true) add('ESC-10', 'el cliente pide un diseño o documento técnico formal', null);

  // estándar = 0 reglas; mixto = exactamente 1 de ESC-03..07; a la medida = ESC-01/02/08/09/10 o 2+ reglas.
  const tipo = !out.length ? 'estándar' : out.length === 1 && !A_LA_MEDIDA.includes(out[0].id) ? 'mixto' : 'a la medida';
  const reglas = out.map((r) => ({ id: r.id, motivo: r.motivo, partes: r.afecta === null ? ['todo el caso'] : prods.filter(r.afecta).map((p) => p.nombre) }));
  if (n(datos.descuento_solicitado_pct) > 10)
    reglas.push({ id: 'AUT-DESC', motivo: `el cliente pide ${datos.descuento_solicitado_pct}% de descuento (más del 10%)`, partes: ['autorización del gerente'] });
  return { reglas, tipo };
}

// Checklist: unión de las preguntas clave de cada candidato + plazo. Máx 6, sin duplicados.
export function checklist(datos = {}, skusCandidatos = [], productosMap = {}) {
  const items = new Map();
  const add = (dato, cubierto = false) => items.size < 5 && !items.has(dato) && items.set(dato, { dato, cubierto });
  const preguntas = skusCandidatos.map((s) => productosMap[s]?.preguntas_clave || []);
  for (let i = 0; i < 3; i++) for (const q of preguntas) if (q[i]) add(String(q[i]).trim());
  if (skusCandidatos.length) items.set('Plazo del contrato (12/24/36)', { dato: 'Plazo del contrato (12/24/36)', cubierto: datos.plazo_meses != null });
  return [...items.values()];
}

// Paquete sugerido determinista: mayor coincidencia de SKUs (o familias) con los candidatos.
export function sugerirPaquete(skusCandidatos = [], paquetes = [], productosMap = {}) {
  if (!skusCandidatos.length) return null;
  const fam = (s) => productosMap[s]?.familia;
  const famsCand = skusCandidatos.map(fam);
  let mejor = null;
  for (const q of paquetes) {
    const ps = q.productos || [];
    const exactos = skusCandidatos.filter((s) => ps.includes(s)).length;
    const famsPaq = new Set(ps.map(fam));
    const porFamilia = famsCand.filter((f) => famsPaq.has(f)).length;
    const famsCubiertas = new Set(famsCand.filter((f) => famsPaq.has(f))).size / famsPaq.size;
    const ok = exactos >= skusCandidatos.length / 2 || (porFamilia >= skusCandidatos.length / 2 && famsCubiertas === 1);
    const fuera = famsCand.length - porFamilia;
    const score = exactos * 2 + porFamilia + famsCubiertas - fuera * 2;
    if (ok && (!mejor || score > mejor.score)) mejor = { id: q.id_paquete, nombre: q.nombre, score };
  }
  return mejor;
}