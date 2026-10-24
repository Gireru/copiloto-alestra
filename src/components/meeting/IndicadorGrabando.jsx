const BARRAS = [0.5, 0.8, 1, 0.7, 0.9, 0.6, 1, 0.75, 0.55, 0.85];
export const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function IndicadorGrabando({ segundos, nivel }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
      <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" />
      <span className="text-sm font-bold tracking-wide text-destructive">GRABANDO</span>
      <span className="font-mono text-sm text-foreground">{mmss(segundos)}</span>
      <div className="ml-auto flex h-6 items-end gap-0.5" aria-label="Nivel de voz">
        {BARRAS.map((f, i) => (
          <span key={i} className="w-1.5 rounded-sm bg-destructive transition-[height] duration-75" style={{ height: `${Math.max(8, nivel * f * 100)}%` }} />
        ))}
      </div>
      {nivel < 0.03 && <span className="text-xs text-muted-foreground">silencio</span>}
    </div>
  );
}