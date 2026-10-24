import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const INSTRUCCIONES = `Eres el copiloto de un vendedor de Alestra en una reunión con un cliente. Usa SOLO el catálogo proporcionado. Nunca inventes productos, SKUs, precios ni capacidades. Si el cliente pregunta algo que no está en el catálogo, responde exactamente: 'No está en el catálogo; lo confirmo con un arquitecto.' Detecta necesidades comparando lo que dice el cliente con senal_del_cliente y problemas_que_resuelve. Sugiere preguntas tomadas de preguntas_clave, en lenguaje simple. Nunca des precios.`;

const REGLAS_SALIDA = `Reglas de salida:
- productos_candidatos: solo SKUs del catálogo; "motivo" debe citar entre comillas las palabras exactas del cliente.
- preguntas_siguientes: máximo 3, tomadas de preguntas_clave, con su sku_fuente. No repitas lo que el cliente ya respondió.
- respuestas_sugeridas: máximo 3 respuestas cortas para el vendedor (sin precios), con sku_fuente.
- paquete_sugerido: id PAQ-xx o cadena vacía "" si ninguno aplica.
- datos_extraidos: OMITE el campo cuando el cliente NO lo dijo explícitamente. No supongas. datos_salud=true solo si mencionan datos de salud/expedientes clínicos. regulacion: texto con lo que mencionen (CNBV, tarjeta, datos sensibles, SAT…) o null. integracion_sistemas=true solo si piden integrar con ERP/CRM/sistemas propios. multinube=true si combinan dos o más nubes o nube con data center propio. disponibilidad_pct si la mencionan. oracle_rac_dataguard=true si mencionan RAC o Data Guard. migracion_servidores = número de servidores a migrar si lo dicen.
- pregunta_del_cliente: si en lo ÚLTIMO que dijo el cliente hay una pregunta directa, devuelve {texto: su pregunta, respuesta: respuesta corta para el vendedor sin precios, sku_fuente}. Si no hay pregunta, omite el campo.
- resumen_necesidad: 1-2 oraciones en lenguaje simple de lo que necesita el cliente, sin precios, cifras ni nombres de productos.
- checklist: los datos que el vendedor debe levantar para cotizar los productos candidatos (usuarios, servidores, TB, plazo, etc.), con cubierto=true si ya se conoce.`;

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
        usuarios: { type: 'number' }, servidores: { type: 'number' }, migracion_servidores: { type: 'number' },
        tb: { type: 'number' }, industria: { type: 'string' }, datos_salud: { type: 'boolean' },
        regulacion: { type: 'string' }, integracion_sistemas: { type: 'boolean' }, multinube: { type: 'boolean' },
        presupuesto_mensual: { type: 'number' }, rpo_min: { type: 'number' }, rto_horas: { type: 'number' },
        disponibilidad_pct: { type: 'number' }, oracle_tb: { type: 'number' }, oracle_rac_dataguard: { type: 'boolean' },
        pide_diseno_formal: { type: 'boolean' }
      }
    },
    checklist: { type: 'array', items: { type: 'object', properties: { dato: { type: 'string' }, cubierto: { type: 'boolean' } } } },
    pregunta_del_cliente: { type: 'object', properties: { texto: { type: 'string' }, respuesta: { type: 'string' }, sku_fuente: { type: 'string' } } },
    resumen_necesidad: { type: 'string' }
  },
  required: ['productos_candidatos', 'preguntas_siguientes', 'respuestas_sugeridas', 'datos_extraidos', 'checklist']
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { texto, descartados, ya_preguntado } = await req.json();
    const desc = new Set(Array.isArray(descartados) ? descartados.slice(0, 50).map(String) : []);
    const hechas = Array.isArray(ya_preguntado) ? ya_preguntado.slice(0, 50).map((s) => String(s).slice(0, 300)) : [];
    if (!texto || typeof texto !== 'string' || !texto.trim()) return Response.json({ error: 'Falta texto' }, { status: 400 });
    const conversacion = texto.slice(0, 12000);

    const [productos, familias, paquetes] = await Promise.all([
      base44.entities.Producto.list('sku', 100),
      base44.entities.Familia.list('id_familia', 50),
      base44.entities.Paquete.list('id_paquete', 50)
    ]);
    const catalogo = {
      familias: familias.map((f) => ({ id: f.id_familia, nombre: f.nombre, problemas_que_resuelve: f.problemas_que_resuelve })),
      productos: productos.map((p) => ({ sku: p.sku, familia: p.familia, nombre: p.nombre, descripcion: p.descripcion, tipo: p.tipo, senal_del_cliente: p.senal_del_cliente, preguntas_clave: p.preguntas_clave, cuando_entra_arquitecto: p.cuando_entra_arquitecto })),
      paquetes: paquetes.map((q) => ({ id: q.id_paquete, nombre: q.nombre, para_quien: q.para_quien, productos: q.productos }))
    };

    const prompt = `${INSTRUCCIONES}\n\n${REGLAS_SALIDA}\n\nCATÁLOGO (JSON):\n${JSON.stringify(catalogo)}\n\n${desc.size ? `SKUs DESCARTADOS POR EL VENDEDOR (no los sugieras): ${[...desc].join(', ')}\n\n` : ''}${hechas.length ? `PREGUNTAS QUE EL VENDEDOR YA HIZO O DESCARTÓ (no las repitas): ${JSON.stringify(hechas)}\n\n` : ''}CONVERSACIÓN CON EL CLIENTE:\n"""${conversacion}"""`;
    const t0 = Date.now();
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema: SCHEMA, model: 'claude-sonnet-5' });
    const ms = Date.now() - t0;

    const skus = new Set(productos.map((p) => p.sku));
    const paqIds = new Set(paquetes.map((q) => q.id_paquete));
    let bloqueadas = 0;
    const keep = (arr, key) => (arr || []).filter((x) => { const ok = skus.has(x?.[key]); if (!ok) bloqueadas++; return ok; });
    const productos_candidatos = keep(out.productos_candidatos, 'sku').filter((c) => !desc.has(c.sku));
    const preguntas_siguientes = keep(out.preguntas_siguientes, 'sku_fuente').filter((p) => !hechas.includes(p.pregunta)).slice(0, 3);
    let pregunta_cliente = out.pregunta_del_cliente?.texto && out.pregunta_del_cliente?.respuesta ? out.pregunta_del_cliente : null;
    if (pregunta_cliente && !pregunta_cliente.respuesta.startsWith('No está en el catálogo') && !skus.has(pregunta_cliente.sku_fuente)) { bloqueadas++; pregunta_cliente = null; }
    const respuestas_sugeridas = (out.respuestas_sugeridas || []).filter((r) => {
      if (r?.texto?.startsWith('No está en el catálogo')) return true;
      const ok = skus.has(r?.sku_fuente); if (!ok) bloqueadas++; return ok;
    }).slice(0, 3);
    let paquete_sugerido = out.paquete_sugerido || null;
    if (paquete_sugerido && !paqIds.has(paquete_sugerido)) { bloqueadas++; paquete_sugerido = null; }

    return Response.json({ productos_candidatos, paquete_sugerido, preguntas_siguientes, respuestas_sugeridas, datos_extraidos: Object.fromEntries(Object.entries(out.datos_extraidos || {}).filter(([, v]) => v !== 0 && v !== '' && v !== false && v !== null)), checklist: out.checklist || [], pregunta_cliente, resumen_necesidad: String(out.resumen_necesidad || '').replace(/\$?\d[\d.,%]*/g, '').trim(), bloqueadas, ms });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}