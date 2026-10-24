import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { transcripcion, cliente } = await req.json();
    if (!transcripcion || typeof transcripcion !== 'string') return Response.json({ error: 'Falta transcripción' }, { status: 400 });
    const prompt = `Redacta UN párrafo (máximo 90 palabras) en español de México para una propuesta comercial de Alestra, describiendo la necesidad del cliente${cliente ? ' ' + String(cliente).slice(0, 100) : ''} con sus propias palabras (puedes citar frases). PROHIBIDO incluir cifras, números, precios, porcentajes o nombres de productos. Tono profesional y cálido.\n\nConversación:\n"""${transcripcion.slice(0, 8000)}"""`;
    const out = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, model: 'claude-sonnet-5', response_json_schema: { type: 'object', properties: { parrafo: { type: 'string' } }, required: ['parrafo'] } });
    const parrafo = String(out.parrafo || '').replace(/\$?\d[\d.,%]*/g, '').replace(/\s{2,}/g, ' ').trim();
    return Response.json({ parrafo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}