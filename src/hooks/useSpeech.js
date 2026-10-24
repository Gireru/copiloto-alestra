import { useRef, useState } from 'react';

export default function useSpeech(onFinal) {
  const [escuchando, setEscuchando] = useState(false);
  const [parcial, setParcial] = useState('');
  const rec = useRef(null);
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const iniciar = () => {
    const r = new SR();
    r.lang = 'es-MX'; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) onFinal(t.trim()); else interim += t;
      }
      setParcial(interim);
    };
    r.onend = () => { if (rec.current === r) r.start(); };
    r.start(); rec.current = r; setEscuchando(true);
  };
  const detener = () => { const r = rec.current; rec.current = null; r?.stop(); setEscuchando(false); setParcial(''); };

  return { soportado: !!SR, escuchando, parcial, alternar: () => (escuchando ? detener() : iniciar()) };
}