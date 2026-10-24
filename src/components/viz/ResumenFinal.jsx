import { motion } from 'framer-motion';
import { Package, ShieldCheck } from 'lucide-react';
import Glass from './Glass';
import CountUp from './CountUp';

const Stat = ({ n, l }) => (
  <div className="text-center"><p className="font-heading text-5xl text-foreground"><CountUp to={n} /></p><p className="text-xs uppercase tracking-wider text-sidebar-foreground/70">{l}</p></div>
);

export default function ResumenFinal({ res }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
      <Glass className="grid grid-cols-3 gap-2">
        <Stat n={res.productos_candidatos?.length || 0} l="Candidatos" />
        <Stat n={res.reglas_disparadas?.length || 0} l="Reglas" />
        <Stat n={res.preguntas_siguientes?.length || 0} l="Preguntas" />
      </Glass>
      {res.bloqueadas > 0 && (
        <Glass className="flex items-center gap-3">
          <motion.span animate={{ opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: 3 }}>
            <ShieldCheck className="h-10 w-10 text-chart-3" />
          </motion.span>
          <div><p className="font-heading text-4xl"><CountUp to={res.bloqueadas} /></p><p className="text-xs text-sidebar-foreground/70">invenciones bloqueadas</p></div>
        </Glass>
      )}
      {res.paquete_sugerido ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="flex items-center gap-3 rounded-2xl border border-warning/60 bg-gradient-to-br from-warning/30 to-primary/20 p-4 shadow-[0_0_40px_hsl(var(--warning)/0.35)]">
          <Package className="h-10 w-10 text-warning" />
          <div><p className="eyebrow text-warning">Paquete sugerido · {res.paquete_sugerido}</p><p className="font-heading text-2xl text-foreground">{res.paquete_nombre}</p></div>
        </motion.div>
      ) : <Glass><p className="text-sm text-sidebar-foreground/70">Sin paquete sugerido: se cotiza por producto.</p></Glass>}
    </motion.div>
  );
}