import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const COLOR = { 'estándar': 'bg-success/15 text-success', mixto: 'bg-warning/15 text-warning', 'a la medida': 'bg-destructive/15 text-destructive' };

export default function MisSesiones() {
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const cargar = async (cursor) => {
    const p = await base44.entities.Sesion.list({ sort: '-created_date', limit: 20, cursor });
    setPage((prev) => (cursor ? { ...p, items: [...prev.items, ...p.items] } : p));
  };
  useEffect(() => { cargar(); }, []);
  if (!page) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const items = page.items.filter((s) => s.transcripcion);
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold tracking-tight">Mis sesiones</h1>
      {!items.length && <p className="py-16 text-center text-lg text-muted-foreground">Todavía no tienes reuniones guardadas.</p>}
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold">{s.cliente || 'Cliente sin nombre'}</p>
              <p className="text-sm text-muted-foreground">{new Date(s.inicio || s.created_date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })} · {(s.productos_candidatos || []).length} productos</p>
            </div>
            {s.tipo_de_caso && <span className={`rounded-full px-3 py-1 text-sm font-semibold ${COLOR[s.tipo_de_caso] || ''}`}>{s.tipo_de_caso}</span>}
            {s.confirmado && <span className="flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Confirmada</span>}
            <Button onClick={() => navigate(`/?sesion=${s.id}`)}><Play className="mr-2 h-4 w-4" />Continuar sesión</Button>
          </div>
        ))}
      </div>
      {page.has_more && <div className="text-center"><Button variant="outline" onClick={() => cargar(page.next_cursor)}>Cargar más</Button></div>}
    </div>
  );
}