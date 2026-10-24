import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCatalog } from '@/lib/catalog';
import useReunion from '@/hooks/useReunion';
import useSpeech from '@/hooks/useSpeech';
import useCamara from '@/hooks/useCamara';
import VideoStage from '@/components/video/VideoStage';
import CopilotoLateral from '@/components/video/CopilotoLateral';
import ResumenLlamada from '@/components/video/ResumenLlamada';

export default function Videollamada() {
  const { data: cat } = useCatalog();
  const r = useReunion(cat);
  const [fin, setFin] = useState(false);
  const voz = useSpeech((t) => r.frase(t));
  const cam = useCamara();

  if (!cat || !r.st || !r.d) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const colgar = () => { if (voz.escuchando) voz.alternar(); cam.apagar(); setFin(true); if (r.st.transcripcion.trim()) r.analizar(); };
  if (fin) return <ResumenLlamada r={r} cat={cat} onNueva={() => { setFin(false); r.nueva(); }} />;

  const ultima = r.st.transcripcion.trim().split('\n').pop();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Videollamada</h1>
        <Input value={r.st.cliente} onChange={(e) => r.set({ cliente: e.target.value })} placeholder="Nombre del cliente" className="h-10 max-w-xs" />
      </div>
      <div className="flex flex-col gap-4 lg:h-[calc(100vh-10rem)] lg:flex-row">
        <VideoStage cam={cam} voz={voz} analizando={r.analizando} ultima={ultima} onColgar={colgar} />
        <CopilotoLateral st={r.st} d={r.d} cat={cat} />
      </div>
    </div>
  );
}