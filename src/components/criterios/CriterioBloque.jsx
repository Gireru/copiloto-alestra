import { motion } from 'framer-motion';

export default function CriterioBloque({ icon: Icon, eyebrow, titulo, intro, pasos, i = 0 }) {
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: i * 0.05 }} className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2 className="mt-4 text-2xl md:text-3xl">{titulo}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
      <ol className="mt-6 grid gap-3 md:grid-cols-2">
        {pasos.map((p, k) => (
          <motion.li key={k} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15 + k * 0.08 }} className="flex gap-3 rounded-xl bg-muted/60 p-4">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{k + 1}</span>
            <div><p className="font-semibold">{p.t}</p><p className="text-sm text-muted-foreground">{p.d}</p></div>
          </motion.li>
        ))}
      </ol>
    </motion.section>
  );
}