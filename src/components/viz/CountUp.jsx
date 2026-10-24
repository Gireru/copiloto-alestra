import { useEffect, useState } from 'react';

export default function CountUp({ to, ms = 900 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const paso = (t) => { const p = Math.min(1, (t - t0) / ms); setN(Math.round(p * to)); if (p < 1) raf = requestAnimationFrame(paso); };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{n}</>;
}