import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Glass from './Glass';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
const STOP = new Set(['coincide', 'tenemos', 'queremos', 'nuestro', 'nuestra', 'porque', 'cuando', 'para', 'como', 'esta', 'este', 'todo', 'todos', 'nuestros']);

export default function TypewriterPanel({ texto, res }) {
  const palabras = useMemo(() => texto.split(/\s+/).filter(Boolean), [texto]);
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = setInterval(() => setN((x) => (x >= palabras.length ? x : x + 1)), 35);
    return () => clearInterval(t);
  }, [palabras]);

  const senales = useMemo(() => {
    const m = {};
    (res?.productos_candidatos || []).forEach((c) => String(c.motivo || '').split(/\s+/).map(norm)
      .filter((w) => w.length >= 4 && !STOP.has(w)).forEach((w) => { m[w] = m[w] || c.sku; }));
    return m;
  }, [res]);

  return (
    <Glass titulo="Transcripción en vivo" className="h-full">
      {!texto && <p className="text-sidebar-foreground/60">Ejecuta la demo o analiza un texto para ver la conversación.</p>}
      <p className="max-h-[420px] overflow-y-auto text-lg leading-relaxed">
        {palabras.slice(0, n).map((w, i) => {
          const sku = senales[norm(w)];
          return (
            <span key={i}>
              {sku ? (
                <motion.span initial={{ backgroundColor: 'rgba(0,184,255,0)' }} animate={{ backgroundColor: 'rgba(217,119,87,0.35)' }} transition={{ duration: 0.6 }}
                  className="relative rounded px-1 font-semibold text-foreground" title={sku}>
                  {w}<sup className="ml-0.5 font-mono text-[9px] text-chart-3">↗{sku.replace('SIM-', '')}</sup>
                </motion.span>
              ) : <span className="text-sidebar-foreground/85">{w}</span>}{' '}
            </span>
          );
        })}
        {n < palabras.length && <span className="inline-block h-5 w-2 animate-pulse bg-chart-3 align-middle" />}
      </p>
    </Glass>
  );
}