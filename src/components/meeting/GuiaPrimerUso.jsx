import { useState } from 'react';
import { Mic, HelpCircle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PASOS = [
  { icon: Mic, t: 'Escucha', d: 'Activa el micrófono o escribe lo que dice el cliente. El copiloto analiza al terminar cada frase.' },
  { icon: HelpCircle, t: 'Pregunta', d: 'Sigue la tarjeta "Pregunta esto ahora". Corrige los datos y la checklist cuando haga falta.' },
  { icon: FileText, t: 'Cotiza', d: 'Termina la reunión, confirma el resumen con el cliente y genera la propuesta.' }
];

export default function GuiaPrimerUso() {
  const [abierto, setAbierto] = useState(() => !localStorage.getItem('guiaVista'));
  const [paso, setPaso] = useState(0);
  const cerrar = () => { localStorage.setItem('guiaVista', '1'); setAbierto(false); };
  const { icon: Icon, t, d } = PASOS[paso];
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader><DialogTitle className="text-center">Paso {paso + 1} de 3</DialogTitle></DialogHeader>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent"><Icon className="h-8 w-8 text-primary" /></div>
        <h3 className="text-2xl font-extrabold">{t}</h3>
        <p className="text-base text-muted-foreground">{d}</p>
        <div className="flex justify-center gap-1.5">{PASOS.map((_, i) => <span key={i} className={`h-2 w-6 rounded-full ${i === paso ? 'bg-primary' : 'bg-muted'}`} />)}</div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={cerrar}>Cerrar</Button>
          <Button onClick={() => (paso < 2 ? setPaso(paso + 1) : cerrar())}>{paso < 2 ? 'Siguiente' : 'Empezar'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}