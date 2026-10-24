import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { clasificar, checklist } from '../../shared/reglas.ts';

const AVISO_DESC = 'Un descuento mayor al 10% requiere autorización del gerente.';

const PROMPT = `Eres el copiloto de un vendedor de Alestra. Usa SOLO el catálogo dado; nunca inventes SKUs, precios ni capacidades. Si preguntan algo fuera del catálogo responde: 'No está en el catálogo; lo confirmo con un arquitecto.' Nunca des precios.
Salida:
- productos_candidatos: SKUs cuya "s" (señal) coincide con lo que dice el cliente; motivo = cita textual del cliente.
- preguntas_siguientes: máx 3, tomadas de "q" del producto, con sku_fuente; no repitas lo ya respondido.
- respuestas_sugeridas: máx 3 respuestas cortas sin precios, con sku_fuente.
- paquete_sugerido: id PAQ-xx si todos sus productos aplican, si no "".
- datos_extraidos: SOLO lo dicho explícitamente; omite lo demás. usuarios = número de personas que usarán el servicio dicho como cantidad; NUNCA uses 1 por mencionar a una persona ("una recepcionista") y no lo deduzcas de empleados. Si hablan de sucursales, usa sucursales (no usuarios). descuento_solicitado_pct si piden un % de descuento. plazo_meses si lo dicen. regulacion: CNBV, tarjeta, datos sensibles, salud… multinube: 2+ nubes o nube+data center propio. pide_diseno_formal: piden diseño de arquitectura o documento técnico.
- pregunta_del_cliente: si lo último que dijo contiene una pregunta directa {texto, respuesta, sku_fuente}; si no, omite.
- resumen_necesidad: 1-2 oraciones simples, sin precios ni productos.`;

const SCHEMA = {
  type: 'object',
  properties: {
    productos_candidatos: { type: 'array', items: { type: 'object', properties: { sku: { type: 'string' }, motivo: { type: 'string' } } } },
    paquete_sugerido: { type: 'string' },
    preguntas_siguientes: { type: 'array', items: { type: 'object', properties: { pregunta: { type: 'string' }, sku_fuente: { type: 'string' } } } },
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
  required: ['productos_candidatos', 'preguntas_siguientes', 'respuestas_sugeridas', 'datos_extraidos']
};

// Limpia datos: quita vacíos y usuarios inventados.
function limpiarDatos(raw, texto, empleados) {
  const d = Object.fromEntries(Object.entries(raw || {}).filter(([, v]) => v !== 0 && v !== '' && v !== false && v !== null && v !== undefined));
  if (d.usuarios != null) {
    const enTexto = new RegExp(`\\b${d.usuarios}\\b`).test(texto.replace(/[,.](?=\d{3})/g, ''));
    if (d.usuarios <= 1 || (!enTexto && (d.usuarios === empleados || d.usuarios === d.sucursales))) delete d.usuarios;
  }
  // Respaldo determinista para descuento solicitado.
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
    const { texto, descartados, ya_preguntado, empleados, sesion_id } = await req.json();
    if (!texto || typeof texto !== 'string' || !texto.trim()) return Response.json({ error: 'Falta texto' }, { status: 400 });
    const desc = new Set(Array.isArray(descartados) ? descartados.slice(0, 50).map(String) : []);
    const hechas = Array.isArray(ya_preguntado) ? ya_preguntado.slice(0, 50).map((s) => String(s).slice(0, 300)) : [];
    const emp = typeof empleados === 'number' && empleados > 0 ? empleados : null;
    const conversacion = texto.slice(0, 8000);

    const [productos, paquetes] = await Promise.all([base44.entities.Producto.list('sku', 100), base44.entities.Paquete.list('id_paquete', 50)]);
    const productosMap = Object.fromEntries(productos.map((p) => [p.sku, p]));
    const cat = {
      p: productos.filter((p) => !desc.has(p.sku)).map((p) => ({ sku: p.sku, n: p.nombre, s: p.senal_del_cliente, q: (p.preguntas_clave || []).slice(0, 2) })),
      paq: paquetes.map((q) => ({ id: q.id_paquete, p: q.productos }))
    };
    const prompt = `${PROMPT}\n\nCATÁLOGO:${JSON.stringify(cat)}\n${emp ? `Empleados de la empresa (contexto, NO son usuarios): ${emp}\n` : ''}${hechas.length ? `Ya preguntado (no repetir): ${JSON.stringify(hechas)}\n` : ''}CONVERSACIÓN:\n"""${conversacion}"""`;

    const t0 = Date.now();
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA, model: 'gemini_3_8_flash' });
    const ms = Date.now() - t0;

    const paqIds = new Set(paquetes.map((q) => q.id_paquete));
    let bloqueadas = 0;
    const keep = (arr, key) => (arr || []).filter((x) => { const ok = !!productosMap[x?.[key]]; if (!ok) bloqueadas++; return ok; });
    const productos_candidatos = keep(out.productos_candidatos, 'sku').filter((c) => !desc.has(c.sku));
    const preguntas_siguientes = keep(out.preguntas_siguientes, 'sku_fuente').filter((p) => !hechas.includes(p.pregunta)).slice(0, 3);
    let pregunta_cliente = out.pregunta_del_cliente?.texto && out.pregunta_del_cliente?.respuesta ? out.pregunta_del_cliente : null;
    if (pregunta_cliente && !pregunta_cliente.respuesta.startsWith('No está en el catálogo') && !productosMap[pregunta_cliente.sku_fuente]) { bloqueadas++; pregunta_cliente = null; }
    let respuestas_sugeridas = (out.respuestas_sugeridas || []).filter((r) => {
      if (r?.texto?.startsWith('No está en el catálogo')) return true;
      const ok = !!productosMap[r?.sku_fuente]; if (!ok) bloqueadas++; return ok;
    }).slice(0, 3);
    let paquete_sugerido = out.paquete_sugerido || null;
    if (paquete_sugerido && !paqIds.has(paquete_sugerido)) { bloqueadas++; paquete_sugerido = null; }

    const datos_extraidos = limpiarDatos(out.datos_extraidos, conversacion, emp);
    if (datos_extraidos.descuento_solicitado_pct > 10 && pregunta_cliente && /descuento/i.test(pregunta_cliente.texto)) pregunta_cliente = { ...pregunta_cliente, respuesta: AVISO_DESC, sku_fuente: '' };
    if (datos_extraidos.descuento_solicitado_pct > 10) respuestas_sugeridas = [{ texto: AVISO_DESC, sku_fuente: '' }, ...respuestas_sugeridas.filter((r) => r.texto !== AVISO_DESC)].slice(0, 3);

    const skus = productos_candidatos.map((c) => c.sku);
    const { reglas, tipo } = clasificar(datos_extraidos, skus, productosMap, conversacion);
    const lista = checklist(datos_extraidos, skus, productosMap);

    if (sesion_id) await base44.entities.Sesion.update(String(sesion_id), { tipo_de_caso: tipo, reglas_disparadas: reglas });

    return Response.json({
      productos_candidatos, paquete_sugerido, preguntas_siguientes, respuestas_sugeridas, datos_extraidos, checklist: lista, pregunta_cliente,
      resumen_necesidad: String(out.resumen_necesidad || '').replace(/\$?\d[\d.,%]*/g, '').trim(),
      tipo_de_caso: tipo, reglas_disparadas: reglas, bloqueadas, ms
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}