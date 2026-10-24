import { useCallback, useRef, useState } from 'react';
import { analizarTexto } from '@/lib/catalog';

export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// etapa: -1 sin correr, 0..6 nodo activo, 7 terminado
export default function useVisualizador() {
  const [texto, setTexto] = useState('');
  const [etapa, setEtapa] = useState(-1);
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [corriendo, setCorriendo] = useState(false);
  const turno = useRef(0);

  const correr = useCallback(async (t, extra = {}) => {
    const yo = ++turno.current;
    const vigente = () => yo === turno.current;
    setTexto(t); setRes(null); setError(null); setCorriendo(true); setEtapa(0);
    await espera(350);
    if (!vigente()) return;
    setEtapa(1); // optimista: la IA ya está procesando
    let r;
    try { r = await analizarTexto(t, extra); } catch (e) {
      if (vigente()) { setError(e.message); setCorriendo(false); }
      return;
    }
    if (!vigente()) return;
    if (r?.error) { setError(r.error); setCorriendo(false); return; }
    setRes(r);
    for (let i = 2; i <= 7; i++) {
      await espera(480);
      if (!vigente()) return;
      setEtapa(i);
    }
    setCorriendo(false);
  }, []);

  return { texto, etapa, res, error, corriendo, correr };
}