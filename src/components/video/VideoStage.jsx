import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoStage({ cam, voz, analizando, ultima, onColgar, children }) {
  const caja = useRef(null);
  const [full, setFull] = useState(false);
  useEffect(() => { const f = () => setFull(!!document.fullscreenElement); document.addEventListener('fullscreenchange', f); return () => document.removeEventListener('fullscreenchange', f); }, []);
  const alternarFull = () => (document.fullscreenElement ? document.exitFullscreen() : caja.current.requestFullscreen());
  const colgar = () => { if (document.fullscreenElement) document.exitFullscreen(); onColgar(); };
  return (
    <div ref={caja} className="relative flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-2xl bg-night">
      <video ref={cam.video} autoPlay muted playsInline className={`absolute inset-0 h-full w-full object-cover ${cam.activa ? '' : 'hidden'}`} />
      {!cam.activa && <div className="m-auto text-center text-white/60"><VideoOff className="mx-auto mb-2 h-10 w-10" /><p>{cam.error || 'Cámara apagada'}</p></div>}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
        {analizando ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Copiloto analizando</> : <><span className={`h-2 w-2 rounded-full ${voz.escuchando ? 'bg-success' : 'bg-white/40'}`} />{voz.escuchando ? 'Copiloto escuchando' : 'Activa el micrófono'}</>}
      </div>
      {(voz.parcial || ultima) && <p className="absolute inset-x-4 bottom-24 mx-auto max-w-2xl rounded-xl bg-black/60 px-4 py-2 text-center text-base text-white">{voz.parcial || ultima}</p>}
      <div className="absolute right-3 top-3 z-10 max-h-[calc(100%-7rem)] w-[min(400px,calc(100%-1.5rem))] overflow-y-auto rounded-xl bg-card/95 shadow-xl backdrop-blur">{children}</div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
        <Button size="icon" onClick={voz.alternar} disabled={!voz.soportado} className={`h-14 w-14 rounded-full ${voz.escuchando ? 'bg-white/20 hover:bg-white/30' : 'bg-destructive hover:bg-destructive/90'} text-white`} title="Micrófono">
          {voz.escuchando ? <Mic className="!h-5 !w-5" /> : <MicOff className="!h-5 !w-5" />}
        </Button>
        <Button size="icon" onClick={cam.alternar} className="h-14 w-14 rounded-full bg-white/20 text-white hover:bg-white/30" title="Cámara">
          {cam.activa ? <Video className="!h-5 !w-5" /> : <VideoOff className="!h-5 !w-5" />}
        </Button>
        <Button size="icon" onClick={alternarFull} className="h-14 w-14 rounded-full bg-white/20 text-white hover:bg-white/30" title="Pantalla completa">
          {full ? <Minimize className="!h-5 !w-5" /> : <Maximize className="!h-5 !w-5" />}
        </Button>
        <Button onClick={colgar} className="h-14 rounded-full bg-destructive px-6 text-white hover:bg-destructive/90"><PhoneOff className="mr-2 h-5 w-5" />Terminar</Button>
      </div>
    </div>
  );
}