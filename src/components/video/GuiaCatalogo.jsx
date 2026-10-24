import { HelpCircle, Plus, Check, Package } from 'lucide-react';
import MatchPerfecto from '@/components/video/MatchPerfecto';

const INICIO = ['¿Qué problema quieren resolver hoy?', '¿Cuántas sedes y empleados tienen?', '¿Qué servicios de TI usan actualmente?', '¿Tienen alguna fecha o presupuesto en mente?'];

export default function GuiaCatalogo({ r, cat, correo }) {
  const { st, d } = r;
  const hechas = new Set(st.preguntas_hechas || []);
  const skus = new Set(d.productos.map((p) => p.sku));
  const clave = [...new Set([...(correo?.preguntas_clave || []), ...d.productos.flatMap((p) => cat.productosMap[p.sku]?.preguntas_clave || [])])];
  const preguntas = (clave.length ? clave : INICIO).filter((q) => !hechas.has(q)).slice(0, 5);
  const recs = [...new Set([...(correo?.skus_relacionados || []), ...d.productos.flatMap((p) => cat.productosMap[p.sku]?.se_recomienda_con || [])])]
    .filter((s) => !skus.has(s) && cat.productosMap[s]).slice(0, 4);
  const marcar = (q) => r.set((p) => ({ preguntas_hechas: [...(p.preguntas_hechas || []), q] }));
  const agregar = (s) => r.set((p) => ({ productos_manuales: [...p.productos_manuales, s] }));

  const completo = !!correo?.preguntas_clave?.length && correo.preguntas_clave.every((q) => hechas.has(q));

  return (
    <div className="space-y-4 border-b border-border p-4 text-foreground">
      <MatchPerfecto activo={completo} r={r} />
      {correo && <p className="rounded-lg bg-accent p-2.5 text-xs text-accent-foreground"><b>Correo de {correo.empresa}:</b> {correo.asunto}</p>}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><HelpCircle className="h-4 w-4 text-primary" />Preguntas clave</h3>
        <ol className="space-y-2">{preguntas.map((q, i) => (
          <li key={q} className="flex items-start gap-2 rounded-lg border border-border bg-background p-2.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
            <p className="flex-1 text-sm leading-snug text-foreground">{q}</p>
            <button onClick={() => marcar(q)} title="Ya la hice" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-success"><Check className="h-4 w-4" /></button>
          </li>
        ))}</ol>
      </section>
      {recs.length > 0 && <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4 text-primary" />Recomendado del catálogo</h3>
        <ul className="space-y-2">{recs.map((s) => (
          <li key={s} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5">
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{cat.productosMap[s].nombre}</p><p className="font-mono text-xs text-muted-foreground">{s}</p></div>
            <button onClick={() => agregar(s)} className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-3.5 w-3.5" />Agregar</button>
          </li>
        ))}</ul>
      </section>}
    </div>
  );
}