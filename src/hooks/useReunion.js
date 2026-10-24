import { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { analizarTexto } from '@/lib/catalog';
import { vacia, fromRecord, derivar, toRecord } from '@/lib/sesion';

const MAX_ESPERA = 15000; // analiza a más tardar cada 15 s
const LIMITE_IA = 10000;  // después de 10 s se avisa que el copiloto no está disponible

export default function useReunion(cat) {
  const [st, setSt] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [falla, setFalla] = useState(false);
  const ref = useRef(st); ref.current = st;
  const enCurso = useRef(false), pendiente = useRef(false), ultimo = useRef(''), timer = useRef(null), porFrase = useRef(false);

  const d = useMemo(() => (st && cat ? derivar(st, cat.productosMap) : null), [st, cat]);
  const set = (patch) => setSt((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) }));

  const nueva = async () => {
    const r = await base44.entities.Sesion.create({ inicio: new Date().toISOString(), inventadas_bloqueadas: 0 });
    window.history.replaceState(null, '', '/');
    localStorage.setItem('sesionActual', r.id);
    ultimo.current = ''; setFalla(false);
    setSt({ ...vacia(), id: r.id, inicio: r.inicio });
  };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('sesion');
    if (!id) { nueva(); return; }
    base44.entities.Sesion.get(id).then((r) => { localStorage.setItem('sesionActual', r.id); const s = fromRecord(r); ultimo.current = s.transcripcion.trim(); setSt(s); });
    return () => clearTimeout(timer.current);
  }, []);

  const analizar = async (forzar = false) => {
    const cur = ref.current; const texto = cur?.transcripcion.trim();
    if (!texto || (!forzar && texto === ultimo.current)) return;
    if (enCurso.current) { pendiente.current = true; return; }
    clearTimeout(timer.current); timer.current = null;
    enCurso.current = true; ultimo.current = texto; setAnalizando(true);
    const lento = setTimeout(() => setFalla(true), LIMITE_IA);
    try {
      const r = await analizarTexto(texto, { descartados: cur.descartados, ya_preguntado: cur.preguntas_hechas, empleados: cur.empleados ?? null, sesion_id: cur.id });
      setFalla(false);
      setSt((p) => ({
        ...p,
        ia: { preguntas_siguientes: r.preguntas_siguientes, respuestas_sugeridas: r.respuestas_sugeridas, paquete_sugerido: r.paquete_sugerido, pregunta_cliente: r.pregunta_cliente, resumen_necesidad: r.resumen_necesidad || p.ia.resumen_necesidad },
        datos_ia: r.datos_extraidos || {}, productos_ia: r.productos_candidatos || [], checklist_ia: r.checklist || [],
        inventadas_bloqueadas: p.inventadas_bloqueadas + (r.bloqueadas || 0)
      }));
    } catch {
      setFalla(true); ultimo.current = '';
    } finally {
      clearTimeout(lento); enCurso.current = false; setAnalizando(false);
      if (pendiente.current) { pendiente.current = false; analizar(); }
    }
  };

  // Disparador: al terminar una frase del micrófono, o a más tardar 15 s después de un cambio.
  useEffect(() => {
    const t = st?.transcripcion.trim();
    if (!t || t === ultimo.current) return;
    if (porFrase.current) { porFrase.current = false; analizar(); return; }
    if (!timer.current) timer.current = setTimeout(() => { timer.current = null; analizar(); }, MAX_ESPERA);
  }, [st?.transcripcion]);

  // Guardado automático (también alimenta la vista del cliente en vivo).
  const guardar = () => ref.current && cat && base44.entities.Sesion.update(ref.current.id, toRecord(ref.current, derivar(ref.current, cat.productosMap)));
  useEffect(() => { if (!st?.id || !cat) return; const t = setTimeout(guardar, 700); return () => clearTimeout(t); }, [st, cat]);

  const append = (t) => set((p) => ({ transcripcion: (p.transcripcion ? p.transcripcion + '\n' : '') + t }));
  return {
    st, d, analizando, falla, set, nueva, guardar,
    analizar: () => analizar(true),
    append,
    frase: (t) => { porFrase.current = true; append(t); }
  };
}