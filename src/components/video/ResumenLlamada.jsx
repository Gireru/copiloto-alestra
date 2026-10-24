import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CotizacionPDF from '@/components/meeting/CotizacionPDF';

export default function ResumenLlamada({ r, cat, onNueva }) {
  const { st, d } = r;
  const navigate = useNavigate();
  const puntos = [
    ...Object.entries(d.datos).filter(([k]) => k !== 'industria').map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v === true ? 'sí' : v}`),
    ...d.reglas.map((x) => `Escalar: ${x.motivo}`)
  ];
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-6 md:p-8">
      <div><p className="eyebrow">Videollamada terminada</p><h1 className="mt-1 text-3xl">Resumen{st.cliente ? ` · ${st.cliente}` : ''}</h1><div className="gradient-rule mt-3" /></div>
      {r.analizando ? <p className="flex items-center gap-2 text-primary"><Loader2 className="h-4 w-4 animate-spin" />Preparando resumen…</p>
        : <p className="text-lg leading-relaxed">{st.ia.resumen_necesidad || 'Sin resumen: no se captó conversación suficiente.'}</p>}
      {puntos.length > 0 && <div><p className="eyebrow mb-2">Puntos clave</p><ul className="space-y-1.5">{puntos.map((p, i) => <li key={i} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{p}</li>)}</ul></div>}
      <div><p className="eyebrow mb-2">Productos</p>
        {d.productos.length ? <div className="flex flex-wrap gap-2">{d.productos.map((p) => <span key={p.sku} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{cat.productosMap[p.sku]?.nombre}</span>)}</div>
          : <p className="text-muted-foreground">Ninguno detectado.</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <CotizacionPDF st={st} d={d} cat={cat} />
        <Button variant="outline" className="h-12" onClick={async () => { await r.guardar(); navigate(`/?sesion=${st.id}`); }}><FileText className="mr-2 h-4 w-4" />Abrir en reunión</Button>
        <Button variant="ghost" className="h-12" onClick={onNueva}><Video className="mr-2 h-4 w-4" />Nueva videollamada</Button>
      </div>
    </div>
  );
}