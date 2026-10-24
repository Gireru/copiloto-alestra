import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, MessageCircle, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sku = ({ s }) => s ? <span className="shrink-0 rounded-md bg-card px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">{s}</span> : null;

export default function PreguntaCard({ preguntas, preguntaCliente, onHecha, onNoAplica, onRespondida }) {
  const [idx, setIdx] = useState(0);
  if (preguntaCliente) return (
    <motion.div key="resp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-success/40 bg-success/10 p-5">
      <div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-success"><MessageCircle className="h-4 w-4" />Respóndele esto</h3><Sku s={preguntaCliente.sku_fuente} /></div>
      <p className="text-sm text-muted-foreground">El cliente preguntó: “{preguntaCliente.texto}”</p>
      <p className="mt-2 text-2xl font-semibold leading-snug">{preguntaCliente.respuesta}</p>
      <Button onClick={onRespondida} className="mt-4 h-11 text-base"><Check className="mr-2 h-4 w-4" />Ya le respondí</Button>
    </motion.div>
  );
  if (!preguntas.length) return <p className="rounded-2xl border border-dashed p-8 text-center text-lg text-muted-foreground">Cuando el cliente hable, aquí verás qué preguntar.</p>;
  const p = preguntas[idx % preguntas.length];
  return (
    <AnimatePresence mode="wait">
      <motion.div key={p.pregunta} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border-2 border-primary/30 bg-accent p-5">
        <div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary"><HelpCircle className="h-4 w-4" />Pregunta esto ahora</h3><Sku s={p.sku_fuente} /></div>
        <p className="text-2xl font-semibold leading-snug">{p.pregunta}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => onHecha(p.pregunta)} className="h-11 text-base"><Check className="mr-2 h-4 w-4" />Ya la hice</Button>
          <Button variant="outline" onClick={() => onNoAplica(p.pregunta)} className="h-11 text-base"><X className="mr-2 h-4 w-4" />No aplica</Button>
          <Button variant="ghost" onClick={() => setIdx(idx + 1)} disabled={preguntas.length < 2} className="h-11 text-base"><RefreshCw className="mr-2 h-4 w-4" />Otra</Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}