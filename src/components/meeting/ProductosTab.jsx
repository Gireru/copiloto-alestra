import { X } from 'lucide-react';
import ProductSearch from './ProductSearch';

export default function ProductosTab({ productos, productosMap, catalogo, onDescartar, onAgregar }) {
  return (
    <div className="space-y-3">
      {!productos.length && <p className="text-muted-foreground">Aún no hay productos detectados.</p>}
      <ul className="space-y-2">
        {productos.map((c) => (
          <li key={c.sku} className="flex items-start gap-2 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold">{c.sku}</span><span className="font-semibold">{productosMap[c.sku]?.nombre}</span><span className="text-xs text-muted-foreground">{productosMap[c.sku]?.tipo}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{c.motivo}</p>
            </div>
            <button onClick={() => onDescartar(c.sku)} title="Descartar en esta sesión" className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      <ProductSearch productos={catalogo} excluir={new Set(productos.map((c) => c.sku))} onAgregar={onAgregar} />
    </div>
  );
}