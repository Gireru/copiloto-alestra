import Glass from './Glass';

const tok = (s) => Math.ceil(String(s || '').length / 4);

export default function TelemetriaViz({ res, texto }) {
  const t = res?.tiempos || {};
  const total = (t.catalogo_ms || 0) + (t.llm_ms || 0) + (t.clasificacion_ms || 0);
  const barras = [['Catálogo', t.catalogo_ms, 'bg-chart-3'], ['LLM', t.llm_ms, 'bg-chart-4'], ['Reglas', t.clasificacion_ms, 'bg-chart-1']];
  const kpis = [
    ['Latencia total', `${total} ms`], ['Modo', res?.modo === 'ia' ? 'IA + reglas' : 'Determinista'],
    ['Tokens entrada ≈', tok(texto).toLocaleString('es-MX')], ['SKUs válidos', res?.productos_candidatos?.length ?? 0],
    ['Alucinaciones bloqueadas', res?.bloqueadas ?? 0], ['Reglas disparadas', res?.reglas_disparadas?.length ?? 0]
  ];
  return (
    <Glass titulo="Telemetría de la ejecución">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {kpis.map(([k, v]) => <div key={k} className="rounded-lg border border-white/10 bg-white/5 p-3"><p className="font-mono text-[11px] uppercase text-sidebar-foreground/60">{k}</p><p className="font-mono text-lg text-white">{v}</p></div>)}
      </div>
      <div className="mt-4 space-y-2">
        {barras.map(([n, ms, c]) => (
          <div key={n} className="flex items-center gap-3 font-mono text-xs">
            <span className="w-16 text-sidebar-foreground/70">{n}</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-white/10"><div className={`h-full ${c} transition-all duration-700`} style={{ width: `${total ? ((ms || 0) / total) * 100 : 0}%` }} /></div>
            <span className="w-16 text-right text-white">{ms ?? 0} ms</span>
          </div>
        ))}
      </div>
    </Glass>
  );
}