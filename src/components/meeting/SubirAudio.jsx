import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { transcribirArchivo } from '@/lib/transcribir';

export default function SubirAudio({ onTexto }) {
  const input = useRef(null);
  const [estado, setEstado] = useState(null);
  const subir = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setEstado({ error: 'El audio debe pesar menos de 25 MB.' }); return; }
    setEstado({ cargando: true });
    try {
      const texto = await transcribirArchivo(file);
      if (texto) onTexto(texto);
      setEstado(texto ? null : { error: 'No se detectó voz en el audio.' });
    } catch {
      setEstado({ error: 'No se pudo transcribir el audio.' });
    }
    input.current.value = '';
  };
  return (
    <div>
      <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.mp4,.flac" className="hidden" onChange={(e) => subir(e.target.files[0])} />
      <Button variant="outline" onClick={() => input.current.click()} disabled={estado?.cargando} className="h-11 w-full text-base">
        {estado?.cargando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transcribiendo audio…</> : <><Upload className="mr-2 h-4 w-4" />Subir audio de la reunión</>}
      </Button>
      {estado?.error && <p className="mt-1 text-sm text-destructive">{estado.error}</p>}
    </div>
  );
}