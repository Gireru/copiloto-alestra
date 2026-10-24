import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { sesion_id, para, pdf_base64 } = await req.json();
    const email = String(para || '').trim().toLowerCase();
    if (!sesion_id || !email || typeof pdf_base64 !== 'string') return Response.json({ error: 'Faltan datos' }, { status: 400 });
    if (pdf_base64.length > 6_000_000) return Response.json({ error: 'El PDF es demasiado grande' }, { status: 400 });
    // La sesión debe ser del vendedor (RLS); el destinatario debe ser usuario de la app.
    const sesion = await base44.entities.Sesion.get(sesion_id);
    if (!sesion) return Response.json({ error: 'Sesión no encontrada' }, { status: 404 });
    const usuarios = await base44.asServiceRole.entities.User.filter({ email });
    if (!usuarios.length) return Response.json({ error: 'Ese correo no es usuario de la app. Invita primero al arquitecto.' }, { status: 400 });
    const cliente = String(sesion.cliente || 'Cliente').slice(0, 100);
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: `Expediente técnico: ${cliente}`,
      body: `<p>Hola,</p><p>${user.full_name || user.email} te envía el expediente técnico de <b>${cliente}</b> para su revisión. Encontrarás el PDF adjunto con el resumen, las reglas de escalamiento disparadas, lo que ya se preguntó y las preguntas técnicas pendientes.</p><p>Copiloto Alestra</p>`,
      attachments: [{ filename: `Expediente-${cliente.replace(/[^\w-]+/g, '-')}.pdf`, content: pdf_base64 }]
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}