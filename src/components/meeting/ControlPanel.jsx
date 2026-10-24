import { useEffect, useState } from 'react';
import { Gauge, CheckCircle2, Circle } from 'lucide-react';
import Panel from './Panel';
import Semaforo from './Semaforo';
import DatosChips from './DatosChips';
import EscalarDialog from './EscalarDialog';

function Cronometro({ inicio }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const s = inicio ? Math.max(0, Math.floor((now - new Date(inicio).getTime()) / 1000)) : 0;
  const mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
  return <p className="font-heading text-5xl font-extrabold tabular-nums tracking-tight">{mm}:{ss}</p>;
}

const Titulo = ({ children }) => <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">{children}</h3>;

export default function ControlPanel({ r }) {
  const { st, d, set } = r;
  return (
    <Panel title="Control" icon={Gauge}>
      <div className="space-y-6">
        <div className="rounded-xl bg-accent p-3 text-center"><p className="text-sm font-medium text-accent-foreground">Tiempo de reunión</p><Cronometro inicio={st.inicio} /></div>
        <Semaforo tipo={d.tipo} reglas={d.reglas} />
        <EscalarDialog motivo={st.escalado_motivo} onCambiar={(m) => set({ escalado_motivo: m })} />
        <div><Titulo>Datos del cliente</Titulo>
          <DatosChips datos={d.datos} manuales={st.datos_manuales} onCambiar={(k, v) => set((p) => ({ datos_manuales: { ...p.datos_manuales, [k]: v } }))} />
        </div>
        <div><Titulo>Checklist de levantamiento</Titulo>
          {!d.checklist.length && <p className="text-base text-muted-foreground">Aparecerá al analizar la conversación.</p>}
          <ul className="space-y-1.5">
            {d.checklist.map((c) => (
              <li key={c.dato}><button onClick={() => set((p) => ({ checklist_manual: { ...p.checklist_manual, [c.dato]: !c.cubierto } }))}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-base transition ${c.cubierto ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {c.cubierto ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-destructive" />}<span>{c.dato}</span>
              </button></li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}