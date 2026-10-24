import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Glass from './Glass';

const TIPOS = {
  'estándar': { l: 'Estándar', c: 'bg-success/20 text-success border-success/40' },
  'mixto': { l: 'Mixto', c: 'bg-warning/20 text-warning border-warning/40' },
  'a la medida': { l: 'A la medida', c: 'bg-destructive/20 text-destructive border-destructive/40' }
};

export default function ReglasViz({ reglas, tipo }) {
  const t = TIPOS[tipo] || { l: tipo || '—', c: 'bg-white/10 text-foreground border-white/20' };
  return (
    <Glass titulo="Reglas de escalamiento">
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }}
        className={`mb-3 inline-block rounded-2xl border px-5 py-2 font-heading text-3xl ${t.c}`}>{t.l}</motion.div>
      {!reglas.length && <p className="text-sm text-sidebar-foreground/60">Ninguna regla disparada: caso estándar.</p>}
      <div className="space-y-2">
        {reglas.map((r, i) => (
          <motion.div key={r.id || i} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/15 p-2">
            <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.8, repeat: 2, delay: 0.2 + i * 0.15 }}>
              <AlertTriangle className="h-5 w-5 text-primary" />
            </motion.span>
            <div><p className="font-mono text-sm font-bold text-primary">{r.id}</p>
              <p className="text-sm text-sidebar-foreground/85">{r.motivo || r.razon || r.texto || r.nombre || ''}</p></div>
          </motion.div>
        ))}
      </div>
    </Glass>
  );
}