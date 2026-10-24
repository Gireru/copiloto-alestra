import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ProductSearch({ productos, excluir, onAgregar }) {
  const [q, setQ] = useState('');
  const t = q.trim().toLowerCase();
  const res = t ? productos.filter((p) => !excluir.has(p.sku) && `${p.nombre} ${p.sku} ${p.familia}`.toLowerCase().includes(t)).slice(0, 6) : [];
  return (
    <div>
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto del catálogo para agregar" className="h-10 pl-9" /></div>
      {res.length > 0 && (
        <ul className="mt-2 divide-y rounded-lg border">
          {res.map((p) => (
            <li key={p.sku}><button onClick={() => { onAgregar(p.sku); setQ(''); }} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted">
              <Plus className="h-4 w-4 text-primary" /><span className="font-medium">{p.nombre}</span><span className="ml-auto font-mono text-xs text-muted-foreground">{p.sku}</span>
            </button></li>
          ))}
        </ul>
      )}
      {t && !res.length && <p className="mt-2 text-sm text-muted-foreground">Sin resultados en el catálogo.</p>}
    </div>
  );
}