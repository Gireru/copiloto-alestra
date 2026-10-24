import { useState } from 'react';
import { Circle, Square, Loader2, FileAudio, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useGrabadora from '@/hooks/useGrabadora';
import { transcribirArchivo } from '@/lib/transcribir';
import IndicadorGrabando, { mmss } from './IndicadorGrabando';

const PASOS = { subiendo: 'Guardando audio…', transcribiendo: 'Transcribiendo…' };

export default function GrabarAudio({ onTexto }) {
  const g = useGrabadora();
  const [paso, setPaso] = useState(null);

  const transcribir = async () => {
    const { blob, mime } = g.grabacion;
    const ext = mime.includes('mp4') ? 'm4a' : 'webm';
    const file = new File([blob], `reunion-${Date.now()}.${ext}`, { type: mime.split(';')[0] });
    g.setError(null);
    let actual = 'subiendo';
    try {
      const texto = await transcribirArchivo(file, (p) => { actual = p; setPaso(p); });
      if (!texto) { g.setError('No se detectó voz en la grabación.'); return; }
      onTexto(texto); g.descartar();
    } catch (e) {
      g.setError(`No se pudo ${actual === 'subiendo' ? 'guardar' : 'transcribir'} el audio: ${e?.message || 'error desconocido'}.`);
    } finally { setPaso(null); }
  };

  return (
    <div className="space-y-2">
      {g.grabando ? (
        <>
          <IndicadorGrabando segundos={g.segundos} nivel={g.nivel} />
          <Button onClick={g.detener} variant="destructive" className="h-11 w-full text-base"><Square className="mr-2 h-4 w-4" />Detener y guardar</Button>
        </>
      ) : (
        <Button onClick={g.iniciar} variant="outline" disabled={!!paso} className="h-11 w-full text-base"><Circle className="mr-2 h-4 w-4 fill-destructive text-destructive" />Grabar audio de la reunión</Button>
      )}
      {g.grabacion && !g.grabando && (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <p className="flex items-center gap-2 text-sm font-medium"><FileAudio className="h-4 w-4 text-primary" />Grabación guardada · {mmss(g.grabacion.segundos)} · {(g.grabacion.blob.size / 1048576).toFixed(2)} MB</p>
          <audio controls src={g.grabacion.url} className="w-full" />
          <div className="flex gap-2">
            <Button onClick={transcribir} disabled={!!paso} className="h-10 flex-1">{paso ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{PASOS[paso]}</> : 'Transcribir'}</Button>
            <Button onClick={g.descartar} disabled={!!paso} variant="outline" className="h-10"><Trash2 className="mr-2 h-4 w-4" />Descartar</Button>
          </div>
        </div>
      )}
      {g.error && <p className="text-sm text-destructive">{g.error}</p>}
    </div>
  );
}