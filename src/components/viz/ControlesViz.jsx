import { useState } from 'react';
import { Play, Square, Zap, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Glass from './Glass';

const campo = 'rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground outline-none focus:border-chart-3';

export default function ControlesViz({ casos, sel, setSel, demoOn, onDemo, onStop, onCaso, onPropio, corriendo }) {
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ texto: '', industria: '', empleados: '' });
  return (
    <Glass>
      <div className="flex flex-wrap items-center gap-2">
        {demoOn ? <Button onClick={onStop} variant="destructive" className="h-11"><Square className="mr-2 h-4 w-4" />Detener demo</Button>
          : <Button onClick={onDemo} className="btn-gradient h-11"><Play className="mr-2 h-4 w-4" />Ejecutar demo ({casos.length} casos)</Button>}
        <select value={sel} onChange={(e) => setSel(e.target.value)} className={`${campo} h-11 max-w-xs`} disabled={demoOn}>
          {casos.map((c) => <option key={c.id} value={c.id} className="bg-sidebar">{c.id_caso} · {c.empresa}</option>)}
        </select>
        <Button variant="outline" className="h-11 border-white/20" onClick={onCaso} disabled={demoOn || corriendo}><Zap className="mr-2 h-4 w-4" />Analizar caso</Button>
        <Button variant="outline" className="h-11 border-white/20" onClick={() => setAbierto(!abierto)} disabled={demoOn}><PenLine className="mr-2 h-4 w-4" />Analizar texto propio</Button>
      </div>
      {abierto && (
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_140px_auto]">
          <textarea rows={2} placeholder="Escribe lo que dice el cliente…" value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} className={campo} />
          <input placeholder="Industria" value={f.industria} onChange={(e) => setF({ ...f, industria: e.target.value })} className={campo} />
          <input type="number" min="1" placeholder="Empleados" value={f.empleados} onChange={(e) => setF({ ...f, empleados: e.target.value })} className={campo} />
          <Button className="h-full" disabled={!f.texto.trim() || corriendo}
            onClick={() => onPropio(f.texto.trim(), { industria: f.industria || null, empleados: Number(f.empleados) || null })}>Analizar</Button>
        </div>
      )}
    </Glass>
  );
}