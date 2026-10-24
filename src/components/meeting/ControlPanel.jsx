import { useEffect, useState } from 'react';
import { Gauge, CheckCircle2, XCircle } from 'lucide-react';
import Panel from './Panel';
import Semaforo from './Semaforo';

function Cronometro({ inicio }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = inicio ? Math.max(0, Math.floor((now - new Date(inicio).getTime()) / 1000)) : 0;
  const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  return <p className="font-heading text-6xl font-extrabold tabular-nums tracking-tight">{mm}:{ss}</p>;
}

export default function ControlPanel({ checklist, tipo, reglas, inicio }) {
  return (
    <Panel title="Control" icon={Gauge}>
      <div className="space-y-6">
        <div className="rounded-xl bg-accent p-4 text-center">
          <p className="text-sm font-medium text-accent-foreground">Tiempo de reunión</p>
          <Cronometro inicio={inicio} />
        </div>
        <Semaforo tipo={tipo} reglas={reglas} />
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Checklist de levantamiento</h3>
          {!checklist.length && <p className="text-base text-muted-foreground">Aparecerá al analizar la conversación.</p>}
          <ul className="space-y-1.5">
            {checklist.map((c, i) => (
              <li key={c.dato + i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base ${c.cubierto ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {c.cubierto ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}<span className="text-foreground">{c.dato}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}