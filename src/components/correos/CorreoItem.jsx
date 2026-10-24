import { motion } from 'framer-motion';
import { Mail, MailOpen } from 'lucide-react';

export default function CorreoItem({ c, activo, nuevo, onClick }) {
  return (
    <motion.li layout initial={nuevo ? { opacity: 0, y: -40, scale: 0.9 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: nuevo ? 0.6 : 0, type: 'spring', stiffness: 260, damping: 18 }}>
      <button onClick={onClick} className={`relative w-full rounded-lg border p-3 text-left transition-colors ${activo ? 'border-primary bg-accent' : 'bg-card hover:bg-muted'} ${nuevo ? 'ring-2 ring-primary/40' : ''}`}>
        {nuevo && <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
          <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" /><span className="h-2 w-2 rounded-full bg-primary-foreground" /></span>Nuevo
        </span>}
        <p className="flex items-center gap-2 text-sm font-semibold">
          {nuevo ? <motion.span initial={{ rotate: -20 }} animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ delay: 1.1, duration: 0.8 }}><Mail className="h-4 w-4 text-primary" /></motion.span> : <MailOpen className="h-4 w-4 text-muted-foreground" />}
          {c.empresa}
        </p>
        <p className={`mt-1 truncate text-sm ${nuevo ? 'font-semibold' : ''}`}>{c.asunto}</p>
        <p className="text-xs text-muted-foreground">{c.remitente}</p>
      </button>
    </motion.li>
  );
}