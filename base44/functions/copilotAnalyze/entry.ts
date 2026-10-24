import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clasificar, checklist, sugerirPaquete } from '../../shared/reglas.ts';

const AVISO_DESC = 'Un descuento mayor al 10% requiere autorización del gerente.';
const LLM_TIMEOUT_MS = 8000;
const CACHE_MS = 5 * 60 * 1000;
let cache = null; // { t, productos, paquetes }

const PROMPT = `Eres el copiloto de un vendedor de Alestra. Usa SOLO el catálogo; nunca inventes SKUs ni precios. Si preguntan algo fuera del catálogo responde: 'No está en el catálogo; lo confirmo con un arquitecto.'
- productos_candidatos: SKUs cuya señal "s" coincide con lo que dice el cliente; motivo = cita textual breve.
- respuestas_sugeridas: máx 3 respuestas cortas sin precios, con sku_fuente.
- datos_extraidos: SOLO lo dicho explícitamente. usuarios = cantidad de personas que usarán el servicio (nunca 1 por mencionar a una persona). sucursales si hablan de sucursales. descuento_solicitado_pct, plazo_meses si se dicen. regulacion: CNBV, tarjeta, datos sensibles, salud. multinube: 2+ nubes o nube+data center propio. integracion_sistemas: ERP/CRM/sistema propio. pide_diseno_formal: piden diseño o documento técnico.
- pregunta_del_cliente: si lo último contiene una pregunta directa {texto, respuesta, sku_fuente}.
- resumen_necesidad: 1-2 oraciones, sin precios; incluye las cifras que dijo el cliente (TB, años, %, usuarios).`;

const SCHEMA = {
  type: 'object',
  properties: {
    productos_candidatos: { type: 'array', items: { type: 'object', properties: { sku: { type: 'string' }, motivo: { type: 'string' } } } },
    respuestas_sugeridas: { type: 'array', items: { type: 'object', properties: { texto: { type: 'string' }, sku_fuente: { type: 'string' } } } },
    datos_extraidos: {
      type: 'object',
      properties: {
        usuarios: { type: 'number' }, sucursales: { type: 'number' }, servidores: { type: 'number' }, migracion_servidores: { type: 'number' },
        tb: { type: 'number' }, industria: { type: 'string' }, datos_salud: { type: 'boolean' }, regulacion: { type: 'string' },
        integracion_sistemas: { type: 'boolean' }, multinube: { type: 'boolean' }, presupuesto_mensual: { type: 'number' },
        rpo_min: { type: 'number' }, rto_horas: { type: 'number' }, disponibilidad_pct: { type: 'number' }, oracle_tb: { type: 'number' },
        oracle_rac_dataguard: { type: 'boolean' }, pide_diseno_formal: { type: 'boolean' }, descuento_solicitado_pct: { type: 'number' }, plazo_meses: { type: 'number' }
      }
    },
    pregunta_del_cliente: { type: 'object', properties: { texto: { type: 'string' }, respuesta: { type: 'string' }, sku_fuente: { type: 'string' } } },
    resumen_necesidad: { type: 'string' }
  },
  required: ['productos_candidatos', 'datos_extraidos']
};

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const STOP = new Set(['tenemos', 'queremos', 'nuestro', 'nuestra', 'nuestros', 'porque', 'cuando', 'tambien', 'nosotros', 'empresa', 'nadie']);

// Respaldo determinista: coincidencia de palabras de la señal del cliente.
function porKeywords(texto, productos) {
  const t = norm(texto);
  return productos.map((p) => {
    const pal = [...new Set(norm(p.senal_del_cliente).match(/[a-z0-9]{5,}/g) || [])].filter((w) => !STOP.has(w));
    const hits = pal.filter((w) => t.includes(w));
    return { sku: p.sku, hits: hits.length, motivo: `Coincide con: ${hits.join(', ')}` };
  }).filter((x) => x.hits >= 2).sort((a, b) => b.hits - a.hits).slice(0, 5).map(({ sku, motivo }) => ({ sku, motivo }));
}

function limpiarDatos(raw, texto, empleados) {
  const d = Object.fromEntries(Object.entries(raw || {}).filter(([, v]) => v !== 0 && v !== '' && v !== false && v !== null && v !== undefined));
  if (d.usuarios != null) {
    const enTexto = new RegExp(`\\b${d.usuarios}\\b`).test(texto.replace(/[,.](?=\d{3})/g, ''));
    if (d.usuarios <= 1 || (!enTexto && d.usuarios === d.sucursales)) delete d.usuarios;
  }
  if (d.usuarios == null && empleados) d.usuarios = empleados;
  if (d.descuento_solicitado_pct == null) {
    const m = texto.match(/(\d{1,2})\s?%[^.\n]{0,25}descuento|descuento[^.\n]{0,25}?(\d{1,2})\s?%/i);
    if (m) d.descuento_solicitado_pct = Number(m[1] || m[2]);
  }
  return d;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { texto, descartados, ya_preguntado, empleados, sesion_id, industria } = await req.json();
    if (!texto || typeof texto !== 'string' || !texto.trim()) return Response.json({ error: 'Falta texto' }, { status: 400 });
    const desc = new Set(Array.isArray(descartados) ? descartados.slice(0, 50).map(String) : []);
    const hechas = Array.isArray(ya_preguntado) ? ya_preguntado.slice(0, 50).map((s) => String(s).slice(0, 300)) : [];
    const emp = typeof empleados === 'number' && empleados > 0 ? empleados : null;
    const conversacion = texto.slice(0, 8000);
    const tiempos = {};

    // 1. Catálogo (cacheado en memoria)
    let t = Date.now();
    if (!cache || Date.now() - cache.t > CACHE_MS) {
      const [productos, paquetes] = await Promise.all([base44.entities.Producto.list('sku', 100), base44.entities.Paquete.list('id_paquete', 50)]);
      cache = { t: Date.now(), productos, paquetes };
    }
    const { productos, paquetes } = cache;
    const productosMap = Object.fromEntries(productos.map((p) => [p.sku, p]));
    tiempos.catalogo_ms = Date.now() - t;

    // 2. Una sola llamada al LLM, con timeout de 20 s
    const cat = productos.filter((p) => !desc.has(p.sku)).map((p) => ({ sku: p.sku, n: p.nombre, s: p.senal_del_cliente }));
    const prompt = `${PROMPT}\n\nCATÁLOGO:${JSON.stringify(cat)}\n${emp ? `Empleados (contexto): ${emp}\n` : ''}CONVERSACIÓN:\n"""${conversacion}"""`;
    t = Date.now();
    let out = null;
    let modo = 'ia';
    try {
      out = await Promise.race([
        base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA, model: 'gemini_3_flash' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), LLM_TIMEOUT_MS))
      ]);
    } catch (e) {
      modo = 'determinista';
      console.log('LLM falló o expiró:', e.message);
      out = { productos_candidatos: porKeywords(conversacion, cat.map((c) => productosMap[c.sku])), datos_extraidos: {}, respuestas_sugeridas: [] };
    }
    tiempos.llm_ms = Date.now() - t;

    // 3. Validación y clasificación determinista
    t = Date.now();
    let bloqueadas = 0;
    const productos_candidatos = (out.productos_candidatos || []).filter((x) => { const ok = !!productosMap[x?.sku]; if (!ok) bloqueadas++; return ok; }).filter((c) => !desc.has(c.sku));
    const skus = productos_candidatos.map((c) => c.sku);
    const preguntas_siguientes = skus.flatMap((s) => (productosMap[s].preguntas_clave || []).map((pregunta) => ({ pregunta, sku_fuente: s })))
      .filter((p) => !hechas.includes(p.pregunta)).slice(0, 3);
    let pregunta_cliente = out.pregunta_del_cliente?.texto && out.pregunta_del_cliente?.respuesta ? out.pregunta_del_cliente : null;
    if (pregunta_cliente && !pregunta_cliente.respuesta.startsWith('No está en el catálogo') && !productosMap[pregunta_cliente.sku_fuente]) { bloqueadas++; pregunta_cliente = null; }
    let respuestas_sugeridas = (out.respuestas_sugeridas || []).filter((r) => {
      if (r?.texto?.startsWith('No está en el catálogo')) return true;
      const ok = !!productosMap[r?.sku_fuente]; if (!ok) bloqueadas++; return ok;
    }).slice(0, 3);

    const datos_extraidos = limpiarDatos(out.datos_extraidos, conversacion, emp);
    if (typeof industria === 'string' && industria.trim()) datos_extraidos.industria = industria.trim().slice(0, 100);
    if (/^no especificad/i.test(String(datos_extraidos.regulacion || ''))) delete datos_extraidos.regulacion;
    if (/^no especificad/i.test(String(datos_extraidos.industria || ''))) delete datos_extraidos.industria;
    if (datos_extraidos.descuento_solicitado_pct > 10 && pregunta_cliente && /descuento/i.test(pregunta_cliente.texto)) pregunta_cliente = { ...pregunta_cliente, respuesta: AVISO_DESC, sku_fuente: '' };
    if (datos_extraidos.descuento_solicitado_pct > 10) respuestas_sugeridas = [{ texto: AVISO_DESC, sku_fuente: '' }, ...respuestas_sugeridas.filter((r) => r.texto !== AVISO_DESC)].slice(0, 3);

    const paq = sugerirPaquete(skus, paquetes, productosMap);
    const { reglas, tipo } = clasificar(datos_extraidos, skus, productosMap, conversacion, emp);
    const lista = checklist(datos_extraidos, skus, productosMap);
    tiempos.clasificacion_ms = Date.now() - t;
    console.log('Tiempos copilotAnalyze', JSON.stringify({ ...tiempos, modo }));

    if (sesion_id) base44.entities.Sesion.update(String(sesion_id), { tipo_de_caso: tipo, reglas_disparadas: reglas }).catch((e) => console.log('No se guardó la sesión:', e.message));

    return Response.json({
      productos_candidatos, paquete_sugerido: paq?.id || null, paquete_nombre: paq?.nombre || null, preguntas_siguientes, respuestas_sugeridas,
      datos_extraidos, checklist: lista, pregunta_cliente,
      resumen_necesidad: String(out.resumen_necesidad || '').replace(/\$\s?\d[\d.,]*(\s?(MXN|pesos))?/gi, '').replace(/\s{2,}/g, ' ').trim(),
      tipo_de_caso: tipo, reglas_disparadas: reglas, bloqueadas, modo, tiempos, ms: tiempos.llm_ms
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}