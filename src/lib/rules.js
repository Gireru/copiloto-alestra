// Reglas de escalamiento: código puro, sin IA.
const NUBES = ['AWS', 'AZ', 'OCI'];
const TODAS = null; // afecta a todo el caso
const MIGRACION = ['SIM-DC-09', 'SIM-AWS-05', 'SIM-AZ-04', 'SIM-OCI-03'];
const LICENCIAS_M365 = ['SIM-M365-01', 'SIM-M365-02', 'SIM-M365-03', 'SIM-M365-04'];

const n = (v) => (typeof v === 'number' && v > 0 ? v : null);

export function evaluarReglas(datos = {}, candidatos = [], productosMap = {}, texto = '') {
  const prods = candidatos.map((c) => productosMap[c.sku]).filter(Boolean);
  const fams = new Set(prods.map((p) => p.familia));
  const nubes = NUBES.filter((f) => fams.has(f));
  const skus = new Set(prods.map((p) => p.sku));
  const reg = String(datos.regulacion || '');
  const out = [];
  const add = (id, motivo, afecta) => out.push({ id, motivo, afecta });

  const medida = prods.filter((p) => p.tipo === 'a la medida');
  if (medida.length) add('ESC-01', `producto a la medida (${medida.map((p) => p.nombre).join(', ')})`, (p) => p.tipo === 'a la medida');

  const lic = LICENCIAS_M365.filter((s) => skus.has(s));
  if ((n(datos.usuarios) > 300 && fams.has('M365')) || lic.length >= 2)
    add('ESC-02', lic.length >= 2 ? 'licencias de Microsoft 365 mezcladas' : `${datos.usuarios} usuarios en Microsoft 365`, (p) => p.familia === 'M365');

  const mig = n(datos.migracion_servidores) || (MIGRACION.some((s) => skus.has(s)) ? n(datos.servidores) : null);
  if (mig > 10) add('ESC-03', `migración de ${mig} servidores`, (p) => MIGRACION.includes(p.sku) || p.familia === 'DC');

  const motivosReg = [];
  if (datos.datos_salud === true) motivosReg.push('datos de salud');
  if (/cnbv/i.test(reg)) motivosReg.push('regulación CNBV');
  if (/tarjeta|pci/i.test(reg)) motivosReg.push('pagos con tarjeta');
  if (/sensible/i.test(reg)) motivosReg.push('datos personales sensibles');
  if (/salud|cl[ií]nic/i.test(reg) && !motivosReg.includes('datos de salud')) motivosReg.push('datos de salud');
  if (motivosReg.length) add('ESC-04', motivosReg.join(', '), TODAS);

  if (datos.integracion_sistemas === true) add('ESC-05', 'integración con sistemas internos (ERP/CRM/propios)', (p) => ['IA', 'OCI', 'DC', 'AWS', 'AZ'].includes(p.familia));

  if (datos.multinube === true || nubes.length >= 2 || (nubes.length >= 1 && fams.has('DC')))
    add('ESC-06', nubes.length >= 2 ? 'combina dos o más nubes' : 'solución híbrida (nube + data center)', (p) => ['DC', 'BK', ...NUBES].includes(p.familia));

  const sla = [];
  if (n(datos.rpo_min) !== null && datos.rpo_min < 15) sla.push(`RPO de ${datos.rpo_min} min`);
  if (n(datos.rto_horas) !== null && datos.rto_horas < 4) sla.push(`RTO de ${datos.rto_horas} h`);
  if (n(datos.disponibilidad_pct) > 99.95) sla.push(`disponibilidad de ${datos.disponibilidad_pct}%`);
  if (sla.length) add('ESC-07', sla.join(', '), (p) => ['DC', 'BK'].includes(p.familia));

  if (n(datos.oracle_tb) > 2 || datos.oracle_rac_dataguard === true || /\bRAC\b|data ?guard/i.test(texto))
    add('ESC-08', n(datos.oracle_tb) > 2 ? `Oracle de ${datos.oracle_tb} TB` : 'Oracle con RAC / Data Guard', (p) => p.familia === 'OCI');

  if (n(datos.presupuesto_mensual) > 250000) add('ESC-09', `presupuesto de $${datos.presupuesto_mensual.toLocaleString('es-MX')} MXN/mes`, TODAS);
  if (datos.pide_diseno_formal === true) add('ESC-10', 'el cliente pide un diseño o documento técnico formal', TODAS);

  let tipo = 'estándar';
  if (out.length) {
    const afectado = (p) => out.some((r) => r.afecta === TODAS || r.afecta(p));
    const libres = prods.filter((p) => !afectado(p));
    tipo = libres.length ? 'mixto' : 'a la medida';
  }
  const reglas = out.map((r) => ({
    id: r.id,
    motivo: r.motivo,
    partes: r.afecta === TODAS ? ['todo el caso'] : prods.filter(r.afecta).map((p) => p.nombre)
  }));
  return { reglas, tipo };
}