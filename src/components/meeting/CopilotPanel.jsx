import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, MessageCircle, Package, Loader2, ShieldCheck } from 'lucide-react';
import Panel from './Panel';

const Sku = ({ s }) => <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">{s}</span>;

function Card({ texto, sku }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start justify-between gap-3 rounded-xl border bg-background p-4">
      <p className="text-lg font-medium leading-snug">{texto}</p>{sku && <Sku s={sku} />}
    </motion.div>
  );
}

export default function CopilotPanel({ analisis, analizando, productosMap, paquete, bloqueadas }) {
  const a = analisis || {};
  return (
    <Panel title="Copiloto" icon={Sparkles} right={
      <div className="flex items-center gap-3">
        {analizando && <span className="flex items-center gap-1.5 text-sm text-primary"><Loader2 className="h-4 w-4 animate-spin" />Analizando</span>}
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />Respuestas inventadas bloqueadas: <b className="text-foreground">{bloqueadas}</b></span>
      </div>}>
      {!analisis && <p className="py-12 text-center text-lg text-muted-foreground">Cuando el cliente hable, aquí verás qué preguntar y qué responder.</p>}
      {analisis && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><HelpCircle className="h-4 w-4" />Pregunta esto ahora</h3>
            <div className="space-y-2"><AnimatePresence>{(a.preguntas_siguientes || []).map((p, i) => <Card key={p.pregunta + i} texto={p.pregunta} sku={p.sku_fuente} />)}</AnimatePresence></div>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><MessageCircle className="h-4 w-4" />Puedes responder</h3>
            <div className="space-y-2"><AnimatePresence>{(a.respuestas_sugeridas || []).map((r, i) => <Card key={r.texto + i} texto={r.texto} sku={r.sku_fuente} />)}</AnimatePresence></div>
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground"><Package className="h-4 w-4" />Productos detectados</h3>
            {paquete && <p className="mb-2 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">Paquete sugerido: <b>{paquete.id_paquete} · {paquete.nombre}</b> ({paquete.descuento_pct}% de descuento)</p>}
            <ul className="space-y-2">
              {(a.productos_candidatos || []).map((c) => (
                <li key={c.sku} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2"><Sku s={c.sku} /><span className="font-semibold">{productosMap[c.sku]?.nombre}</span><span className="text-xs text-muted-foreground">{productosMap[c.sku]?.tipo}</span></div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.motivo}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  );
}