import { HelpCircle } from 'lucide-react';

export default function CorreoDetalle({ c, accion }) {
  return (
    <article className="space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-2xl">{c.asunto}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{c.remitente} · {c.email} · {c.empresa} ({c.industria}, {c.empleados} empleados)</p>
      </div>
      <p className="whitespace-pre-line text-[15px] leading-relaxed">{c.cuerpo}</p>
      <div className="rounded-lg bg-muted p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><HelpCircle className="h-4 w-4 text-primary" />Preguntas clave para la llamada</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm">{(c.preguntas_clave || []).map((q) => <li key={q}>{q}</li>)}</ol>
      </div>
      {accion}
    </article>
  );
}