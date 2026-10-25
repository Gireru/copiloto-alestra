import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCatalog } from '@/lib/catalog';
import useVisualizador, { espera } from '@/hooks/useVisualizador';
import Glass from '@/components/viz/Glass';
import ControlesViz from '@/components/viz/ControlesViz';
import PipelineCanvas from '@/components/viz/PipelineCanvas';
import TypewriterPanel from '@/components/viz/TypewriterPanel';
import ProductosViz from '@/components/viz/ProductosViz';
import ReglasViz from '@/components/viz/ReglasViz';
import DatosChecklistViz from '@/components/viz/DatosChecklistViz';
import ResumenFinal from '@/components/viz/ResumenFinal';
import TelemetriaViz from '@/components/viz/TelemetriaViz';
import JsonViz from '@/components/viz/JsonViz';

export default function Visualizador() {
  const { data: cat } = useCatalog();
  const v = useVisualizador();
  const [sel, setSel] = useState('');
  const [demoOn, setDemoOn] = useState(false);
  const demo = useRef(false);
  const casos = cat?.casos || [];
  useEffect(() => { if (!sel && casos[0]) setSel(casos[0].id); }, [casos, sel]);
  useEffect(() => () => { demo.current = false; }, []);

  const correrCaso = (c) => v.correr(c.mensaje_inicial, { empleados: c.empleados ?? null, industria: c.industria || null });
  const ejecutarDemo = async () => {
    demo.current = true; setDemoOn(true);
    const inicio = Math.max(0, casos.findIndex((c) => c.id === sel));
    for (const c of [...casos.slice(inicio), ...casos.slice(0, inicio)]) {
      if (!demo.current) break;
      setSel(c.id);
      const t0 = Date.now();
      await correrCaso(c);
      const resto = 8000 - (Date.now() - t0);
      if (resto > 0 && demo.current) await espera(resto);
    }
    demo.current = false; setDemoOn(false);
  };

  const { etapa, res } = v;
  return (
    <div className="dark -mx-4 -my-6 min-h-screen bg-night p-4 text-foreground md:-mx-8 md:-my-8 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div><p className="eyebrow text-chart-3">Pipeline en tiempo real</p><h1 className="mt-1 text-4xl text-white">Visualizador IA</h1><div className="gradient-rule mt-3" /></div>
        {!cat ? <div className="grid h-60 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-chart-3" /></div> : <>
          <ControlesViz casos={casos} sel={sel} setSel={setSel} demoOn={demoOn} corriendo={v.corriendo}
            onDemo={ejecutarDemo} onStop={() => { demo.current = false; setDemoOn(false); }}
            onCaso={() => { const c = casos.find((x) => x.id === sel); if (c) correrCaso(c); }} onPropio={v.correr} />
          <Glass titulo="Pipeline de copilotAnalyze">
            <PipelineCanvas etapa={etapa} res={res} totalProductos={cat.productos.length} />
            {etapa >= 1 && etapa < 2 && <div className="ai-thinking mt-3" />}
            {v.error && <p className="mt-3 text-sm text-destructive">Error: {v.error}</p>}
          </Glass>
          {res && etapa >= 7 && <ResumenFinal res={res} />}
          {res && etapa >= 2 && <div className="grid gap-5 lg:grid-cols-2"><TelemetriaViz res={res} texto={v.texto} /><JsonViz res={res} /></div>}
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            <TypewriterPanel texto={v.texto} res={etapa >= 2 ? res : null} />
            <div className="space-y-4">
              {res && etapa > 2 && <ProductosViz items={res.productos_candidatos || []} productosMap={cat.productosMap} />}
              {res && etapa > 3 && <ReglasViz reglas={res.reglas_disparadas || []} tipo={res.tipo_de_caso} />}
              {res && etapa > 5 && <DatosChecklistViz datos={res.datos_extraidos} checklist={res.checklist} />}
              {!res && <Glass><p className="text-sm text-sidebar-foreground/60">{v.corriendo ? 'La IA está procesando la conversación…' : 'Los resultados aparecerán aquí en vivo.'}</p></Glass>}
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}