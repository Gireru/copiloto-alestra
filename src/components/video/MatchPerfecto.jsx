import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { Sparkles, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatchPerfecto({ activo, r }) {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activo) return;
    setAbierto(true);
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 }, colors: ['#00B8FF', '#FF00FF', '#D97757'] });
  }, [activo]);

  const enviar = async () => { await r.guardar(); await base44.entities.Sesion.update(r.st.id, { confirmado: true }); navigate(`/propuesta?sesion=${r.st.id}`); };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <motion.div initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="relative w-full max-w-sm rounded-2xl bg-card p-6 text-center text-card-foreground shadow-2xl">
            <button onClick={() => setAbierto(false)} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="btn-gradient mx-auto grid h-16 w-16 place-items-center !rounded-full"><Sparkles className="h-8 w-8" /></motion.div>
            <h2 className="mt-4 text-3xl">¡Match perfecto!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Todas las preguntas clave fueron confirmadas. Ya puedes mandar la cotización.</p>
            <Button onClick={enviar} className="btn-gradient mt-5 h-12 w-full text-base"><FileText className="mr-2 h-4 w-4" />Enviar cotización</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}