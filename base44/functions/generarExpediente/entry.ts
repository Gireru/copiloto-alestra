import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { transcripcion, cliente, reglas, datos, preguntas_hechas, productos } = await req.json();
    if (!transcripcion || typeof transcripcion !== 'string') return Response.json({ error: 'Falta transcripción' }, { status: 400 });
    const prompt = `Eres el copiloto de un vendedor de Alestra. Prepara un expediente breve para el arquitecto de soluciones, en español de México, para que NO vuelva a preguntarle al cliente lo que ya se preguntó. No inventes datos ni precios; usa solo lo de abajo.
Cliente: ${String(cliente || 'Sin nombre').slice(0, 120)}
Reglas de escalamiento disparadas (calculadas por el sistema): ${JSON.stringify(reglas || []).slice(0, 3000)}
Datos ya levantados: ${JSON.stringify(datos || {}).slice(0, 3000)}
Productos detectados: ${JSON.stringify(productos || []).slice(0, 3000)}
Preguntas que el copiloto ya sugirió: ${JSON.stringify(preguntas_hechas || []).slice(0, 3000)}
Conversación:
"""${transcripcion.slice(0, 10000)}"""

Devuelve: resumen (3-5 oraciones), ya_preguntado (lista de lo que ya se sabe, con la respuesta del cliente), preguntas_tecnicas (lista de preguntas técnicas pendientes, solo para las partes que disparan reglas).`;
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt, model: 'claude-sonnet-5',
      response_json_schema: { type: 'object', properties: { resumen: { type: 'string' }, ya_preguntado: { type: 'array', items: { type: 'string' } }, preguntas_tecnicas: { type: 'array', items: { type: 'string' } } }, required: ['resumen', 'ya_preguntado', 'preguntas_tecnicas'] }
    });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}