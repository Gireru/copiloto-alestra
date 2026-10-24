import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatchPerfecto({ activo, r }) {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activo) return;
    setAbierto(true);
    const colors = ['#16a34a', '#22c55e', '#4ade80', '#bbf7d0', '#ffffff'];
    confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors, zIndex: 9999 });
    const t = setInterval(() => {
      confetti({ particleCount: 50, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors, zIndex: 9999 });
      confetti({ particleCount: 50, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors, zIndex: 9999 });
    }, 400);
    setTimeout(() => clearInterval(t), 2400);
    return () => clearInterval(t);
  }, [activo]);

  const enviar = async () => { await r.guardar(); await base44.entities.Sesion.update(r.st.id, { confirmado: true }); navigate(`/propuesta?sesion=${r.st.id}`); };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <motion.div initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="relative w-full max-w-sm rounded-2xl bg-card p-6 text-center text-card-foreground shadow-2xl">
            <button onClick={() => setAbierto(false)} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/40"><CheckCircle2 className="h-9 w-9" /></motion.div>
            <h2 className="mt-4 text-3xl text-success">¡Match perfecto!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Todas las preguntas clave fueron confirmadas. Ya puedes mandar la cotización.</p>
            <Button onClick={enviar} className="mt-5 h-12 w-full bg-success text-base font-bold text-success-foreground hover:bg-success/90"><FileText className="mr-2 h-4 w-4" />Enviar cotización</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}