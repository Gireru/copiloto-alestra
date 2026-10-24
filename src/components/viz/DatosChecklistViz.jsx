import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Glass from './Glass';

const val = (v) => (v === true ? 'sí' : String(v));

export default function DatosChecklistViz({ datos, checklist }) {
  const entradas = Object.entries(datos || {});
  return (
    <Glass titulo="Datos extraídos y checklist">
      <div className="mb-4 flex flex-wrap gap-2">
        {!entradas.length && <p className="text-sm text-sidebar-foreground/60">Sin datos explícitos.</p>}
        {entradas.map(([k, v], i) => (
          <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-full border border-chart-3/40 bg-chart-3/15 px-3 py-1 text-sm">
            <span className="text-sidebar-foreground/70">{k.replace(/_/g, ' ')}:</span> <b>{val(v)}</b>
          </motion.span>
        ))}
      </div>
      <ul className="space-y-1.5">
        {(checklist || []).map((c, i) => (
          <motion.li key={c.dato} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${c.cubierto ? 'bg-success/15' : 'bg-destructive/15'}`}>
            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.45 + i * 0.12, type: 'spring' }}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.cubierto ? 'bg-success' : 'bg-destructive'}`}>
              {c.cubierto ? <Check className="h-3.5 w-3.5 text-white" /> : <X className="h-3.5 w-3.5 text-white" />}
            </motion.span>{c.dato}
          </motion.li>
        ))}
      </ul>
    </Glass>
  );
}