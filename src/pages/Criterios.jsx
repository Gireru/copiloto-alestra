import { motion } from 'framer-motion';
import CriterioBloque from '@/components/criterios/CriterioBloque';
import { PRINCIPIOS, BLOQUES } from '@/lib/criterios';

export default function Criterios() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-16">
      <motion.header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
        className="bg-night overflow-hidden rounded-3xl p-8 md:p-12">
        <p className="eyebrow text-white/70">Cómo piensa el copiloto</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Criterios de preguntas y recomendaciones</h1>
        <motion.div initial={{ width: 0 }} animate={{ width: 120 }} transition={{ delay: 0.4, duration: 0.8 }} className="gradient-rule mt-5" />
        <p className="mt-5 max-w-2xl text-white/80">Cada sugerencia que ves en pantalla sigue reglas claras y verificables. La IA entiende y redacta; el catálogo y el código deciden.</p>
      </motion.header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {PRINCIPIOS.map((p, i) => (
          <motion.div key={p.t} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.1 }}
            className="rounded-2xl border bg-card p-5">
            <p className="font-heading text-4xl text-primary">{p.n}</p>
            <p className="mt-1 font-semibold">{p.t}</p>
            <p className="text-sm text-muted-foreground">{p.d}</p>
          </motion.div>
        ))}
      </div>
      {BLOQUES.map((b, i) => <CriterioBloque key={b.titulo} {...b} i={i} />)}
    </div>
  );
}