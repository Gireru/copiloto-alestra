import { useNavigate } from 'react-router-dom';
import { Zap, FileText, RotateCcw, Loader2, MonitorUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalog } from '@/lib/catalog';
import useReunion from '@/hooks/useReunion';
import ConversationPanel from '@/components/meeting/ConversationPanel';
import CopilotPanel from '@/components/meeting/CopilotPanel';
import CierreDialog from '@/components/meeting/CierreDialog';
import GuiaPrimerUso from '@/components/meeting/GuiaPrimerUso';
import CotizacionPDF from '@/components/meeting/CotizacionPDF';
import PropuestaPanel from '@/components/meeting/PropuestaPanel';

export default function Reunion() {
  const { data: cat } = useCatalog();
  const navigate = useNavigate();
  const r = useReunion(cat);
  const { st, d, set } = r;

  if (!cat || !st || !d) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const generar = async () => { await r.guardar(); navigate(`/propuesta?sesion=${st.id}`); };

  return (
    <div className="space-y-5">
      <GuiaPrimerUso />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="eyebrow">Levantamiento · En vivo</p><h1 className="mt-1 text-4xl">Reunión en vivo</h1><div className="gradient-rule mt-3" /></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={r.nueva} className="h-12 text-base"><RotateCcw className="mr-2 h-4 w-4" />Nueva reunión</Button>
          <Button variant="outline" onClick={() => window.open(`/cliente?sesion=${st.id}`, 'vistaCliente', 'width=1100,height=800')} className="h-12 text-base"><MonitorUp className="mr-2 h-4 w-4" />Mostrar al cliente</Button>
          <Button variant="secondary" onClick={r.analizar} disabled={r.analizando || !st.transcripcion.trim()} className="h-12 text-base"><Zap className="mr-2 h-4 w-4" />Analizar ahora</Button>
          <CierreDialog r={r} />
          <CotizacionPDF st={st} d={d} cat={cat} />
          <Button onClick={generar} disabled={!st.confirmado || !d.productos.length} title={st.confirmado ? '' : 'Primero termina la reunión y confirma con el cliente'} className="btn-gradient h-12 text-base hover:opacity-95"><FileText className="mr-2 h-4 w-4" />Generar propuesta</Button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <ConversationPanel transcript={st.transcripcion} cliente={st.cliente} setCliente={(v) => set({ cliente: v })} casos={cat.casos}
          onAppend={r.append} onFrase={r.frase} onReplace={(v) => set({ transcripcion: v })}
          onCargarCaso={(c) => set({ cliente: c.empresa, industria: c.industria, empleados: c.empleados, transcripcion: c.mensaje_inicial })} />
        <CopilotPanel r={r} cat={cat} falla={r.falla} analizando={r.analizando} />
      </div>
      <PropuestaPanel st={st} d={d} cat={cat} />
    </div>
  );
}