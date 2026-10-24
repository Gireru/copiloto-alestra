import { useEffect, useRef, useState } from 'react';

export default function useCamara() {
  const video = useRef(null);
  const stream = useRef(null);
  const [activa, setActiva] = useState(false);
  const [error, setError] = useState('');

  const encender = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.current = s; if (video.current) video.current.srcObject = s;
      setActiva(true); setError('');
    } catch { setError('No se pudo acceder a la cámara'); }
  };
  const apagar = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setActiva(false); };

  useEffect(() => apagar, []);
  return { video, activa, error, alternar: () => (activa ? apagar() : encender()), apagar };
}