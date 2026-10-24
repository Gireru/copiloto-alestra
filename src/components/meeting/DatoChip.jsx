import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mostrar = (def, v) => (def.tipo === 'bool' ? (v ? 'Sí' : 'No') : typeof v === 'number' ? v.toLocaleString('es-MX') : v);

export default function DatoChip({ def, valor, manual, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const [txt, setTxt] = useState('');
  const fijar = (v) => { onCambiar(v); setAbierto(false); };
  const definido = valor !== undefined;
  return (
    <Popover open={abierto} onOpenChange={(o) => { setAbierto(o); setTxt(definido ? String(valor) : ''); }}>
      <PopoverTrigger asChild>
        <button className={`rounded-full border px-3 py-1.5 text-sm transition ${definido ? 'border-primary/30 bg-accent text-accent-foreground' : 'border-dashed text-muted-foreground hover:bg-muted'}`}>
          {def.label}{definido && <>: <b>{mostrar(def, valor)}</b></>}{manual && <span className="ml-1 text-xs opacity-60">✎</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2">
        <p className="text-sm font-semibold">{def.label}</p>
        {def.tipo === 'bool' ? (
          <div className="flex gap-2"><Button size="sm" onClick={() => fijar(true)}>Sí</Button><Button size="sm" variant="outline" onClick={() => fijar(false)}>No</Button></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); fijar(def.tipo === 'number' ? (txt === '' ? null : Number(txt)) : txt.trim() || null); }} className="flex gap-2">
            <Input autoFocus type={def.tipo === 'number' ? 'number' : 'text'} value={txt} onChange={(e) => setTxt(e.target.value)} className="h-9" />
            <Button size="sm" type="submit">OK</Button>
          </form>
        )}
        {definido && <Button size="sm" variant="ghost" className="w-full" onClick={() => fijar(null)}>Quitar dato</Button>}
      </PopoverContent>
    </Popover>
  );
}