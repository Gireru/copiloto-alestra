import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/lib/catalog';
import { correrCaso } from '@/lib/evaluacion';
import EvalCards from '@/components/eval/EvalCards';

export default function Evaluacion() {
  const { data: cat } = useCatalog();
  const [res, setRes] = useState([]);
  const [corriendo, setCorriendo] = useState(false);

  const correr = async () => {
    setCorriendo(true); setRes([]);
    try {
      const casos = [...cat.casos];
      for (let i = 0; i < casos.length; i += 5) {
        const lote = await Promise.all(casos.slice(i, i + 5).map((c) => correrCaso(c, cat)));
        setRes((p) => [...p, ...lote]);
      }
    } finally { setCorriendo(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Evaluación</h1><p className="text-lg text-muted-foreground">Corre el copiloto y las reglas contra los 10 casos de prueba.</p></div>
        <Button onClick={correr} disabled={!cat || corriendo} className="h-12 text-base">{corriendo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}{corriendo ? `Corriendo… ${res.length}/10` : 'Correr los 10 casos'}</Button>
      </div>
      {res.length > 0 && <EvalCards res={res} />}
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-base">
          <thead><tr className="border-b bg-muted text-left text-sm text-muted-foreground">
            {['Caso', 'Esperado', 'Obtenido', '', 'Reglas detectadas', 'Info faltante pedida', 'Tiempo'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {res.map((r) => (
              <tr key={r.caso.id} className="border-b">
                <td className="px-4 py-3"><p className="font-semibold">{r.caso.id_caso}</p><p className="text-sm text-muted-foreground">{r.caso.empresa}</p></td>
                <td className="px-4 py-3">{r.caso.tipo_de_caso}</td>
                <td className="px-4 py-3">{r.tipo}</td>
                <td className={`px-4 py-3 text-2xl font-bold ${r.ok ? 'text-success' : 'text-destructive'}`}>{r.ok ? '✓' : '✗'}</td>
                <td className="px-4 py-3 text-sm">{r.reglas.map((x) => <span key={x.id} className="mr-1 inline-block rounded bg-secondary px-2 py-0.5 font-mono text-xs" title={x.motivo}>{x.id}</span>)}{!r.reglas.length && '—'}</td>
                <td className="px-4 py-3 tabular-nums">{r.cobertura}%</td>
                <td className="px-4 py-3 tabular-nums">{(r.ms / 1000).toFixed(1)} s</td>
              </tr>
            ))}
            {!res.length && <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">{corriendo ? 'Analizando casos…' : 'Presiona "Correr los 10 casos" para empezar.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}