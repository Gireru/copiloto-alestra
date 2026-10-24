import { motion, AnimatePresence } from 'framer-motion';

const ESTADOS = {
  'estándar': { label: 'Estándar', color: 'bg-success', ring: 'ring-success/30', text: 'text-success', idx: 2 },
  mixto: { label: 'Mixto', color: 'bg-warning', ring: 'ring-warning/30', text: 'text-warning', idx: 1 },
  'a la medida': { label: 'Requiere arquitecto', color: 'bg-destructive', ring: 'ring-destructive/30', text: 'text-destructive', idx: 0 }
};
const LUCES = ['bg-destructive', 'bg-warning', 'bg-success'];

export default function Semaforo({ tipo, reglas }) {
  const e = ESTADOS[tipo] || ESTADOS['estándar'];
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2 rounded-2xl bg-foreground p-2.5">
          {LUCES.map((c, i) => (
            <motion.div key={c} animate={{ opacity: i === e.idx ? 1 : 0.15, scale: i === e.idx ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className={`h-9 w-9 rounded-full ${c}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={tipo} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`font-heading text-3xl font-extrabold ${e.text}`}>{e.label}</motion.p>
        </AnimatePresence>
      </div>
      <ul className="mt-4 space-y-2">
        <AnimatePresence>
          {reglas.map((r) => (
            <motion.li key={r.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border-l-4 border-warning bg-muted p-3 text-base">
              <b>{r.id}: {r.motivo}</b> → el arquitecto entra solo para esta parte{r.partes.length ? `: ${r.partes.join(', ')}` : ''}
            </motion.li>
          ))}
        </AnimatePresence>
        {!reglas.length && <li className="text-base text-muted-foreground">Ninguna regla de escalamiento disparada.</li>}
      </ul>
    </div>
  );
}