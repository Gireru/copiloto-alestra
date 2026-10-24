import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function EscalarDialog({ motivo, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [txt, setTxt] = useState('');
  if (motivo) return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
      <p><b>Escalado a arquitecto:</b> {motivo}</p>
      <button onClick={() => onCambiar('')} className="mt-1 font-medium text-primary hover:underline">Quitar escalamiento</button>
    </div>
  );
  return (
    <>
      <Button variant="outline" className="h-11 w-full text-base" onClick={() => { setTxt(''); setAbierto(true); }}><Briefcase className="mr-2 h-4 w-4" />Escalar a arquitecto</Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Escalar a arquitecto</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">El caso pasará a Mixto. ¿Por qué lo escalas?</p>
          <Textarea autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Ej. el cliente quiere un diseño de red entre sus sucursales" />
          <DialogFooter><Button disabled={!txt.trim()} onClick={() => { onCambiar(txt.trim()); setAbierto(false); }}>Escalar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}