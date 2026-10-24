import { useState } from 'react';
import { Flag, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import DatosChips from './DatosChips';

export default function CierreDialog({ r }) {
  const { st, d, set } = r;
  const [abierto, setAbierto] = useState(false);
  const [txt, setTxt] = useState('');
  const [cargando, setCargando] = useState(false);

  const abrir = async () => {
    setAbierto(true); setTxt(st.resumen_cliente || st.ia.resumen_necesidad || ''); setCargando(true);
    try {
      const { data } = await base44.functions.invoke('redactarNecesidad', { transcripcion: st.transcripcion, cliente: st.cliente });
      if (data.parrafo) setTxt(data.parrafo);
    } catch { /* si la IA falla, el vendedor redacta el resumen a mano */ } finally { setCargando(false); }
  };
  const confirmar = () => { set({ resumen_cliente: txt.trim(), confirmado: true, fin: new Date().toISOString() }); setAbierto(false); };

  return (
    <>
      <Button variant={st.confirmado ? 'outline' : 'secondary'} onClick={abrir} disabled={!st.transcripcion.trim()} className="h-12 text-base">
        {st.confirmado ? <><CheckCircle2 className="mr-2 h-4 w-4 text-success" />Cliente confirmó</> : <><Flag className="mr-2 h-4 w-4" />Terminar reunión</>}
      </Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Confirmar con el cliente</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Léele el resumen y corrige lo que haga falta.</p>
          <div className="relative">
            <Textarea value={txt} onChange={(e) => setTxt(e.target.value)} className="min-h-[150px] text-lg leading-relaxed" placeholder="Resumen de lo que necesita el cliente" />
            {cargando && <span className="absolute right-3 top-3 flex items-center gap-1 text-sm text-primary"><Loader2 className="h-4 w-4 animate-spin" />Redactando…</span>}
          </div>
          <div><p className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Datos clave</p>
            <DatosChips datos={d.datos} manuales={st.datos_manuales} onCambiar={(k, v) => set((p) => ({ datos_manuales: { ...p.datos_manuales, [k]: v } }))} />
          </div>
          <DialogFooter><Button onClick={confirmar} disabled={!txt.trim() || cargando} className="h-11 text-base"><CheckCircle2 className="mr-2 h-4 w-4" />Cliente confirmó</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}