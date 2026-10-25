import { useState } from 'react';
import Glass from './Glass';

export default function JsonViz({ res }) {
  const [abierto, setAbierto] = useState(false);
  const log = [
    `POST /functions/copilotAnalyze → 200`,
    `catalog.cache  ${res.tiempos?.catalogo_ms ?? 0}ms`,
    `llm.invoke     ${res.tiempos?.llm_ms ?? 0}ms  modo=${res.modo}`,
    `validate.skus  ok=${res.productos_candidatos?.length ?? 0} blocked=${res.bloqueadas ?? 0}`,
    `rules.classify tipo=${res.tipo_de_caso} hits=${res.reglas_disparadas?.length ?? 0}`,
    `package.match  ${res.paquete_sugerido || 'null'}`
  ];
  return (
    <Glass titulo="Log y respuesta cruda">
      <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-xs leading-relaxed text-chart-5">{log.map((l) => `> ${l}`).join('\n')}</pre>
      <button onClick={() => setAbierto(!abierto)} className="mt-3 font-mono text-xs text-chart-3 hover:underline">{abierto ? '− ocultar' : '+ ver'} JSON de respuesta</button>
      {abierto && <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] text-sidebar-foreground/90">{JSON.stringify(res, null, 2)}</pre>}
    </Glass>
  );
}