// Estado de la reunión: combina lo que dice la IA con lo que el vendedor corrige a mano.
import { evaluarReglas } from '@/lib/rules';

export const DATOS_DEF = [
  { key: 'usuarios', label: 'Usuarios', tipo: 'number' },
  { key: 'sucursales', label: 'Sucursales', tipo: 'number' },
  { key: 'servidores', label: 'Servidores', tipo: 'number' },
  { key: 'migracion_servidores', label: 'Servidores a migrar', tipo: 'number' },
  { key: 'tb', label: 'TB', tipo: 'number' },
  { key: 'industria', label: 'Industria', tipo: 'text' },
  { key: 'regulacion', label: 'Regulación', tipo: 'text' },
  { key: 'datos_salud', label: 'Datos de salud', tipo: 'bool' },
  { key: 'integracion_sistemas', label: 'Integración con sistemas', tipo: 'bool' },
  { key: 'multinube', label: 'Multinube / híbrido', tipo: 'bool' },
  { key: 'presupuesto_mensual', label: 'Presupuesto mensual', tipo: 'number' },
  { key: 'rpo_min', label: 'RPO (min)', tipo: 'number' },
  { key: 'rto_horas', label: 'RTO (h)', tipo: 'number' },
  { key: 'disponibilidad_pct', label: 'Disponibilidad %', tipo: 'number' },
  { key: 'oracle_tb', label: 'Oracle TB', tipo: 'number' },
  { key: 'oracle_rac_dataguard', label: 'Oracle RAC / Data Guard', tipo: 'bool' },
  { key: 'pide_diseno_formal', label: 'Pide diseño formal', tipo: 'bool' },
  { key: 'descuento_solicitado_pct', label: 'Descuento pedido %', tipo: 'number' },
  { key: 'plazo_meses', label: 'Plazo (meses)', tipo: 'number' }
];

export const vacia = () => ({
  cliente: '', industria: '', empleados: null, transcripcion: '', ia: {}, datos_ia: {}, datos_manuales: {},
  productos_ia: [], productos_manuales: [], descartados: [], checklist_ia: [], checklist_manual: {},
  preguntas_hechas: [], escalado_motivo: '', resumen_cliente: '', confirmado: false, inventadas_bloqueadas: 0
});

export function fromRecord(r) {
  return {
    ...vacia(), id: r.id, inicio: r.inicio, cliente: r.cliente || '', industria: r.industria || '', empleados: r.empleados ?? null,
    transcripcion: r.transcripcion || '',
    ia: { preguntas_siguientes: r.preguntas_siguientes || [], respuestas_sugeridas: r.respuestas_sugeridas || [], paquete_sugerido: r.paquete_sugerido || null, pregunta_cliente: r.pregunta_cliente || null, resumen_necesidad: r.resumen_necesidad || '' },
    datos_ia: r.datos_ia || r.datos_extraidos || {}, datos_manuales: r.datos_manuales || {},
    productos_ia: r.productos_ia || r.productos_candidatos || [], productos_manuales: r.productos_manuales || [], descartados: r.descartados || [],
    checklist_ia: r.checklist_ia || r.checklist || [], checklist_manual: r.checklist_manual || {}, preguntas_hechas: r.preguntas_hechas || [],
    escalado_motivo: r.escalado_motivo || '', resumen_cliente: r.resumen_cliente || '', confirmado: !!r.confirmado, inventadas_bloqueadas: r.inventadas_bloqueadas || 0
  };
}

export function derivar(st, productosMap) {
  const datos = Object.fromEntries(Object.entries({ ...st.datos_ia, ...st.datos_manuales }).filter(([, v]) => v !== null && v !== '' && v !== undefined));
  const desc = new Set(st.descartados);
  const ia = st.productos_ia.filter((c) => !desc.has(c.sku) && productosMap[c.sku]);
  const manuales = st.productos_manuales.filter((s) => !desc.has(s) && productosMap[s] && !ia.some((c) => c.sku === s)).map((sku) => ({ sku, motivo: 'Agregado por el vendedor' }));
  const productos = [...ia, ...manuales];
  const checklist = st.checklist_ia.map((c) => ({ ...c, cubierto: st.checklist_manual[c.dato] ?? c.cubierto }));
  let { reglas, tipo } = evaluarReglas(datos, productos, productosMap, st.transcripcion, st.empleados);
  if (datos.descuento_solicitado_pct > 10)
    reglas = [...reglas, { id: 'AUT-DESC', motivo: `el cliente pide ${datos.descuento_solicitado_pct}% de descuento (más del 10%)`, partes: ['autorización del gerente'] }];
  if (st.escalado_motivo) {
    reglas = [...reglas, { id: 'MANUAL', motivo: st.escalado_motivo, partes: ['escalado por el vendedor'] }];
    if (tipo === 'estándar') tipo = 'mixto';
  }
  return { datos, productos, checklist, reglas, tipo };
}

export function toRecord(st, d) {
  const { id, ia, ...raw } = st;
  return {
    ...raw, preguntas_siguientes: ia.preguntas_siguientes || [], respuestas_sugeridas: ia.respuestas_sugeridas || [],
    paquete_sugerido: ia.paquete_sugerido || null, pregunta_cliente: ia.pregunta_cliente || null, resumen_necesidad: ia.resumen_necesidad || '',
    datos_extraidos: d.datos, productos_candidatos: d.productos, checklist: d.checklist, reglas_disparadas: d.reglas, tipo_de_caso: d.tipo
  };
}