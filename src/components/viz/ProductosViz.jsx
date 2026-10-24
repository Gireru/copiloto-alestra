import { motion } from 'framer-motion';
import Glass from './Glass';

export default function ProductosViz({ items, productosMap }) {
  return (
    <Glass titulo={`Productos candidatos (${items.length})`}>
      {!items.length && <p className="text-sm text-sidebar-foreground/60">Sin coincidencias en el catálogo.</p>}
      <div className="grid gap-2 sm:grid-cols-2" style={{ perspective: 800 }}>
        {items.map((c, i) => (
          <motion.div key={c.sku} initial={{ rotateY: 90, scale: 0.8, opacity: 0 }} animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 160, damping: 16 }}
            className="rounded-xl border border-chart-3/30 bg-chart-3/10 p-3">
            <p className="font-mono text-xs text-chart-3">{c.sku}</p>
            <p className="font-semibold">{productosMap[c.sku]?.nombre || c.sku}</p>
            <p className="mt-1 text-sm italic text-sidebar-foreground/75">“{c.motivo}”</p>
          </motion.div>
        ))}
      </div>
    </Glass>
  );
}