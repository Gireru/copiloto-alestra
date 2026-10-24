import { AlertCircle, Plus, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Avisos({ faltan, recs, onAgregar }) {
  return (
    <div className="space-y-4">
      {faltan.map(({ producto, opciones }) => (
        <div key={producto.sku} className="rounded-xl border border-warning/40 bg-warning/10 p-4">
          <p className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4 text-warning" />{producto.nombre} necesita alguno de estos productos:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {opciones.map((o) => <Button key={o.sku} size="sm" variant="outline" onClick={() => onAgregar(o.sku)}><Plus className="mr-1 h-3.5 w-3.5" />{o.nombre}</Button>)}
          </div>
        </div>
      ))}
      {recs.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground"><Lightbulb className="h-4 w-4" />Recomendado agregar</h3>
          <div className="flex flex-wrap gap-2">
            {recs.map((p) => <Button key={p.sku} size="sm" variant="secondary" onClick={() => onAgregar(p.sku)}><Plus className="mr-1 h-3.5 w-3.5" />{p.nombre} <span className="ml-1 font-mono text-xs opacity-70">{p.sku}</span></Button>)}
          </div>
        </div>
      )}
    </div>
  );
}