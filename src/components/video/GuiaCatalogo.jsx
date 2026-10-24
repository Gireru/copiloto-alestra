import { HelpCircle, Plus } from 'lucide-react';

const INICIO = ['¿Qué problema quieren resolver hoy?', '¿Cuántas sedes y empleados tienen?', '¿Qué servicios de TI usan actualmente?', '¿Tienen alguna fecha o presupuesto en mente?'];

export default function GuiaCatalogo({ r, cat }) {
  const { st, d } = r;
  const hechas = new Set(st.preguntas_hechas || []);
  const skus = new Set(d.productos.map((p) => p.sku));
  const clave = [...new Set(d.productos.flatMap((p) => cat.productosMap[p.sku]?.preguntas_clave || []))];
  const preguntas = (clave.length ? clave : INICIO).filter((q) => !hechas.has(q)).slice(0, 5);
  const recs = [...new Set(d.productos.flatMap((p) => cat.productosMap[p.sku]?.se_recomienda_con || []))]
    .filter((s) => !skus.has(s) && cat.productosMap[s]).slice(0, 4);
  const marcar = (q) => r.set((p) => ({ preguntas_hechas: [...(p.preguntas_hechas || []), q] }));
  const agregar = (s) => r.set((p) => ({ productos_manuales: [...p.productos_manuales, s] }));

  return (
    <div className="space-y-4 border-b bg-card p-4 text-foreground">
      <div>
        <p className="eyebrow mb-2 flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" />Preguntas clave</p>
        <ul className="space-y-1.5">{preguntas.map((q) => (
          <li key={q}><button onClick={() => marcar(q)} title="Marcar como hecha" className="w-full rounded-lg bg-muted px-3 py-2 text-left text-sm text-foreground hover:bg-accent">{q}</button></li>
        ))}</ul>
      </div>
      {recs.length > 0 && <div>
        <p className="eyebrow mb-2">Recomendado del catálogo</p>
        <ul className="space-y-1.5">{recs.map((s) => (
          <li key={s} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
            <span>{cat.productosMap[s].nombre}</span>
            <button onClick={() => agregar(s)} title="Agregar" className="rounded-md p-1 text-primary hover:bg-accent"><Plus className="h-4 w-4" /></button>
          </li>
        ))}</ul>
      </div>}
    </div>
  );
}