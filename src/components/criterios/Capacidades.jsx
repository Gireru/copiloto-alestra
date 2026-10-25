import { motion } from 'framer-motion';
import { HardDrive, Chrome, Smartphone, Plug, Lock, Download } from 'lucide-react';

const EXT_URL = 'https://base44.app/api/apps/6a95f5fd0e9d584f30962913/files/mp/public/6a95f5fd0e9d584f30962913/f9c33051a_copiloto-alestra-conector.zip';

const ITEMS = [
  { icon: HardDrive, t: 'Funciona en local', d: 'Puede operar dentro de tu infraestructura, sin depender de servidores externos.' },
  { icon: Chrome, t: 'Extensión para Chrome', d: 'Acompaña tus reuniones directamente desde el navegador.' },
  { icon: Smartphone, t: 'Teléfono y computadora', d: 'Diseño adaptable para usarse igual de bien en móvil, tableta o escritorio.' },
  { icon: Plug, t: 'Integración por API', d: 'Se conecta a tus sistemas actuales: CRM, ERP o herramientas internas.' }
];

export default function Capacidades() {
  return (
    <section className="space-y-4">
      <div><p className="eyebrow">Plataforma</p><h2 className="mt-1 text-2xl md:text-3xl">Dónde y cómo lo necesites</h2></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map(({ icon: Icon, t, d }, i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} className="flex gap-4 rounded-2xl border bg-card p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
            <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
          </motion.div>
        ))}
      </div>
      <a href={EXT_URL} download className="btn-gradient inline-flex items-center gap-2 px-5 py-3"><Download className="h-5 w-5" />Descargar extensión para Chrome</a>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="bg-night flex flex-col items-start gap-4 rounded-2xl p-6 md:flex-row md:items-center md:p-8">
        <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.4 }}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10"><Lock className="h-7 w-7" /></motion.span>
        <div><p className="text-xl font-semibold">La seguridad de la información es nuestra prioridad absoluta</p>
          <p className="mt-1 text-white/75">Los datos de tus clientes se protegen en cada paso: captura, análisis, propuesta y envío.</p></div>
      </motion.div>
    </section>
  );
}