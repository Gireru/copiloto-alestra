import { Lightbulb, Package, ShieldAlert } from 'lucide-react';

const Bloque = ({ icon: Icon, titulo, children }) => (
  <div><p className="eyebrow mb-2 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{titulo}</p>{children}</div>
);

export default function CopilotoLateral({ st, d, cat }) {
  const recs = [...(st.ia.pregunta_cliente ? [{ texto: st.ia.pregunta_cliente.respuesta }] : []),
    ...(st.ia.preguntas_siguientes || []).map((p) => ({ texto: `Pregunta: ${p.pregunta}` })),
    ...(st.ia.respuestas_sugeridas || [])].slice(0, 5);
  return (
    <aside className="flex w-full flex-col gap-6 overflow-y-auto rounded-2xl border bg-card p-5 lg:w-[360px]">
      <div className="ai-thinking" />
      <Bloque icon={Lightbulb} titulo="Recomendaciones">
        {recs.length ? <ul className="space-y-2">{recs.map((r, i) => <li key={i} className="rounded-lg bg-muted p-3 text-sm">{r.texto}</li>)}</ul>
          : <p className="text-sm text-muted-foreground">Habla con el cliente; aquí aparecerán sugerencias.</p>}
      </Bloque>
      <Bloque icon={Package} titulo={`Productos (${d.productos.length})`}>
        {d.productos.length ? <ul className="space-y-2">{d.productos.map((p) => <li key={p.sku} className="rounded-lg border p-3 text-sm"><p className="font-semibold">{cat.productosMap[p.sku]?.nombre}</p><p className="text-xs text-muted-foreground">{p.motivo}</p></li>)}</ul>
          : <p className="text-sm text-muted-foreground">Aún no hay productos detectados.</p>}
      </Bloque>
      {d.reglas.length > 0 && <Bloque icon={ShieldAlert} titulo="Requiere arquitecto">
        <ul className="space-y-1 text-sm">{d.reglas.map((r) => <li key={r.id}>• {r.motivo}</li>)}</ul>
      </Bloque>}
    </aside>
  );
}