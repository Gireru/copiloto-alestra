import { analizarTexto } from '@/lib/catalog';
import { evaluarReglas } from '@/lib/rules';
import { calcular, cantidadInicial, verificarPrecios } from '@/lib/quote';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const STOP = new Set(['numero', 'exacto', 'cuantos', 'cuantas', 'tienen', 'quieren', 'necesitan', 'cuanto', 'sobre', 'entre', 'tiene', 'donde', 'actual', 'actuales']);
const raices = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 5 && !STOP.has(w)).map((w) => w.slice(0, 5));

// % de la información faltante que el sistema sí pidió (preguntas + checklist).
export function coberturaFaltante(caso, r) {
  const items = String(caso.informacion_que_falta || '').split(/[;.]/).map((x) => x.trim()).filter(Boolean);
  if (!items.length) return 100;
  const pedido = new Set(raices([...(r.preguntas_siguientes || []).map((p) => p.pregunta), ...(r.checklist || []).map((c) => c.dato)].join(' ')));
  const ok = items.filter((it) => raices(it).some((w) => pedido.has(w)));
  return Math.round((ok.length / items.length) * 100);
}

export async function correrCaso(caso, cat) {
  const t0 = performance.now();
  const r = await analizarTexto(caso.mensaje_inicial);
  const ms = performance.now() - t0;
  const { reglas, tipo } = evaluarReglas(r.datos_extraidos, r.productos_candidatos, cat.productosMap, caso.mensaje_inicial);
  const lineas = r.productos_candidatos.map((c) => ({ sku: c.sku, cantidad: cantidadInicial(cat.productosMap[c.sku], r.datos_extraidos), consumo: 0 }));
  const calc = calcular({ lineas, plazo: 12, productosMap: cat.productosMap, paquetes: cat.paquetes });
  const preciosMal = verificarPrecios(calc.filas, cat.productos).length;
  return { caso, tipo, reglas, ok: tipo === caso.tipo_de_caso, cobertura: coberturaFaltante(caso, r), ms, bloqueadas: r.bloqueadas || 0, preciosMal };
}