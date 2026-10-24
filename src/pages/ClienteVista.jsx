import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Vista limpia para el cliente: solo su necesidad y la checklist, en vivo.
export default function ClienteVista() {
  const id = new URLSearchParams(window.location.search).get('sesion');
  const [s, setS] = useState(null);
  useEffect(() => {
    base44.entities.Sesion.get(id).then(setS);
    return base44.entities.Sesion.subscribe((e) => { if (e.id === id && e.type === 'update') setS(e.data); });
  }, [id]);
  if (!s) return <div className="grid h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const resumen = s.resumen_cliente || s.resumen_necesidad;
  const checklist = s.checklist || [];
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary font-heading text-xl font-extrabold text-primary-foreground">A</div>
          <div><p className="text-sm text-muted-foreground">Alestra</p><h1 className="text-3xl font-extrabold">{s.cliente || 'Bienvenido'}</h1></div>
        </div>
        <section className="rounded-2xl border bg-card p-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Lo que entendimos que necesitas</h2>
          <p className="text-2xl leading-relaxed">{resumen || 'Estamos escuchando…'}</p>
        </section>
        <section className="rounded-2xl border bg-card p-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary">Información para tu propuesta</h2>
          {!checklist.length && <p className="text-xl text-muted-foreground">Aparecerá conforme avance la reunión.</p>}
          <ul className="grid gap-3 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.dato} className="flex items-center gap-3 text-xl">
                {c.cubierto ? <CheckCircle2 className="h-6 w-6 shrink-0 text-success" /> : <Circle className="h-6 w-6 shrink-0 text-muted-foreground" />}{c.dato}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}