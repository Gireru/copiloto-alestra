import { useEffect, useRef, useState } from 'react';

const FORMATOS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
const MAX = 25 * 1024 * 1024;

const mensajeError = (e) => {
  if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') return 'Permiso de micrófono denegado, actívalo en el candado de la barra de direcciones.';
  if (e?.name === 'NotFoundError') return 'No se encontró ningún micrófono conectado.';
  if (e?.name === 'NotReadableError') return 'El micrófono está ocupado por otra aplicación. Ciérrala e intenta de nuevo.';
  return `No se pudo iniciar la grabación: ${e?.message || 'error desconocido'}.`;
};

export default function useGrabadora() {
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [grabacion, setGrabacion] = useState(null); // { blob, url, mime, segundos }
  const [error, setError] = useState(null);
  const r = useRef({});

  const limpiar = () => {
    const x = r.current;
    clearInterval(x.reloj); cancelAnimationFrame(x.raf);
    x.stream?.getTracks().forEach((t) => t.stop());
    x.ctx?.close().catch(() => {});
    r.current = {};
  };
  useEffect(() => () => { limpiar(); }, []);

  const iniciar = async () => {
    setError(null);
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) { setError('Tu navegador no puede grabar; usa Chrome o sube un archivo.'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { setError(mensajeError(e)); return; }
    const mime = FORMATOS.find((f) => MediaRecorder.isTypeSupported(f));
    let rec;
    try { rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach((t) => t.stop()); setError(mensajeError(e)); return; }
    if (grabacion) URL.revokeObjectURL(grabacion.url);
    setGrabacion(null);
    const partes = [];
    const inicio = Date.now();
    rec.ondataavailable = (e) => e.data.size && partes.push(e.data);
    rec.onerror = (e) => setError(`Error durante la grabación: ${e.error?.message || 'desconocido'}.`);
    rec.onstop = () => {
      const tipo = rec.mimeType || mime || 'audio/webm';
      const blob = new Blob(partes, { type: tipo });
      const seg = Math.round((Date.now() - inicio) / 1000);
      limpiar(); setGrabando(false); setNivel(0);
      if (!blob.size) { setError('La grabación quedó vacía (0 KB). Revisa el micrófono e intenta de nuevo.'); return; }
      if (blob.size > MAX) { setError('La grabación pesa más de 25 MB; graba un fragmento más corto.'); return; }
      setGrabacion({ blob, url: URL.createObjectURL(blob), mime: tipo, segundos: seg });
    };

    // Medidor de nivel de voz
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const an = ctx.createAnalyser(); an.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const medir = () => {
      an.getByteTimeDomainData(buf);
      let s = 0; for (const v of buf) s += ((v - 128) / 128) ** 2;
      setNivel(Math.min(1, Math.sqrt(s / buf.length) * 4));
      r.current.raf = requestAnimationFrame(medir);
    };
    r.current = { stream, rec, ctx, reloj: setInterval(() => setSegundos(Math.round((Date.now() - inicio) / 1000)), 500) };
    medir();
    rec.start(1000);
    setSegundos(0); setGrabando(true);
  };

  const detener = () => { const rec = r.current.rec; if (rec && rec.state !== 'inactive') rec.stop(); };
  const descartar = () => { if (grabacion) URL.revokeObjectURL(grabacion.url); setGrabacion(null); setError(null); };

  return { grabando, segundos, nivel, grabacion, error, setError, iniciar, detener, descartar };
}