import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Video } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import CorreoDetalle from '@/components/correos/CorreoDetalle';

export default function Correos() {
  const navigate = useNavigate();
  const { data: correos } = useQuery({ queryKey: ['correos'], queryFn: () => base44.entities.Correo.list('-fecha', 50) });
  const [selId, setSelId] = useState(null);
  if (!correos) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const sel = correos.find((c) => c.id === selId) || correos[0];

  return (
    <div className="space-y-5">
      <div><p className="eyebrow">Bandeja · Simulada</p><h1 className="mt-1 text-3xl md:text-4xl">Correos de clientes</h1><div className="gradient-rule mt-3" /></div>
      {!correos.length ? <p className="text-muted-foreground">No hay correos todavía.</p> : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <ul className="space-y-2">{correos.map((c) => (
            <li key={c.id}><button onClick={() => setSelId(c.id)} className={`w-full rounded-lg border p-3 text-left transition-colors ${sel?.id === c.id ? 'border-primary bg-accent' : 'bg-card hover:bg-muted'}`}>
              <p className="flex items-center gap-2 text-sm font-semibold"><Mail className="h-4 w-4 text-primary" />{c.empresa}</p>
              <p className="mt-1 truncate text-sm">{c.asunto}</p>
              <p className="text-xs text-muted-foreground">{c.remitente}</p>
            </button></li>
          ))}</ul>
          {sel && <CorreoDetalle c={sel} accion={<Button onClick={() => navigate(`/videollamada?correo=${sel.id}`)} className="btn-gradient h-11"><Video className="mr-2 h-4 w-4" />Iniciar videollamada</Button>} />}
        </div>
      )}
    </div>
  );
}