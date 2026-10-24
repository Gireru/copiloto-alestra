import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Mic, Brain, Database, ShieldAlert, Package, ListChecks, FileText, Check } from 'lucide-react';

const fmt = (ms) => (ms == null ? null : ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export default function PipelineCanvas({ etapa, res, totalProductos }) {
  const t = res?.tiempos || {};
  const nodos = [
    { n: 'Transcripción', icon: Mic, sub: res ? `${res.modo === 'ia' ? 'IA' : 'Determinista'}` : null },
    { n: 'Señales (LLM)', icon: Brain, sub: fmt(t.llm_ms) && `LLM: ${fmt(t.llm_ms)}` },
    { n: 'Match catálogo', icon: Database, sub: fmt(t.catalogo_ms) ? `${totalProductos} prod · ${fmt(t.catalogo_ms)}` : `${totalProductos} productos` },
    { n: 'Reglas ESC', icon: ShieldAlert, sub: fmt(t.clasificacion_ms) && `Reglas: ${fmt(t.clasificacion_ms)}` },
    { n: 'Paquete', icon: Package, sub: res ? res.paquete_sugerido || 'Ninguno' : null },
    { n: 'Datos y checklist', icon: ListChecks, sub: res ? `${res.checklist?.length || 0} ítems` : null },
    { n: 'Propuesta', icon: FileText, sub: etapa >= 7 ? 'Lista' : null }
  ];
  return (
    <div className="flex items-start overflow-x-auto px-2 pb-2 pt-2 [scrollbar-width:none]">
      {nodos.map((x, i) => {
        const hecho = etapa > i, activo = etapa === i;
        const Icon = hecho ? Check : x.icon;
        return (
          <Fragment key={x.n}>
            {i > 0 && (
              <div className="relative mt-8 h-0.5 min-w-6 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-chart-3 to-primary" initial={false} animate={{ width: etapa >= i ? '100%' : '0%' }} transition={{ duration: 0.45 }} />
                {activo && [0, 0.3, 0.6].map((d) => (
                  <motion.span key={d} className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-chart-3 shadow-[0_0_10px_hsl(var(--chart-3))]"
                    animate={{ left: ['-5%', '105%'] }} transition={{ duration: 0.9, delay: d, repeat: Infinity, ease: 'easeInOut' }} />
                ))}
              </div>
            )}
            <div className="flex w-24 shrink-0 flex-col items-center text-center sm:w-28">
              <motion.div
                animate={activo ? { scale: [1, 1.12, 1], boxShadow: ['0 0 0px hsl(var(--primary))', '0 0 32px hsl(var(--primary))', '0 0 0px hsl(var(--primary))'] } : { scale: 1, boxShadow: hecho ? '0 0 14px hsl(var(--primary) / 0.5)' : '0 0 0px hsl(var(--primary) / 0)' }}
                transition={activo ? { duration: 1.1, repeat: Infinity } : { duration: 0.3 }}
                className={`grid h-16 w-16 place-items-center rounded-2xl border transition-colors ${hecho ? 'border-primary bg-primary/25 text-primary' : activo ? 'border-chart-3 bg-chart-3/20 text-chart-3' : 'border-white/10 bg-white/5 text-sidebar-foreground/40'}`}>
                <Icon className="h-7 w-7" />
              </motion.div>
              <p className={`mt-2 text-xs font-semibold ${etapa >= i ? 'text-foreground' : 'text-sidebar-foreground/50'}`}>{x.n}</p>
              <p className="mt-0.5 min-h-4 font-mono text-[11px] text-chart-3">{etapa > i || etapa >= 7 ? x.sub : ''}</p>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}