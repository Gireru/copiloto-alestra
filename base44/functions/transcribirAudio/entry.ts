import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { audio_url } = await req.json();
    if (typeof audio_url !== 'string' || !audio_url.startsWith('https://')) return Response.json({ error: 'Falta audio' }, { status: 400 });
    const texto = await base44.asServiceRole.integrations.Core.TranscribeAudio({ audio_url });
    return Response.json({ texto: String(texto || '').trim() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}