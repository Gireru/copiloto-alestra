import { useState } from 'react';
import { Calculator, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cantidadInicial } from '@/lib/quote';
import { propuestaTexto } from '@/lib/propuestaTexto';
import Panel from './Panel';
import PropuestaDesglose from './PropuestaDesglose';

export default function PropuestaPanel({ st, d, cat }) {
  const { toast } = useToast();
  const [plazo, setPlazo] = useState('12');
  const [paquete, setPaquete] = useState(st.ia.paquete_sugerido || 'ninguno');
  const [extra, setExtra] = useState('0');
  const [p, setP] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const generar = async () => {
    setCargando(true); setError('');
    const productos = d.productos.map((c) => ({ sku: c.sku, cantidad: cantidadInicial(cat.productosMap[c.sku], d.datos) }));
    try {
      const r = await base44.functions.invoke('generarPropuesta', { sesion: st.id, productos, plazo_meses: Number(plazo), paquete: paquete === 'ninguno' ? null : paquete, descuento_extra_pct: Number(extra) || 0 });
      setP(r.data);
    } catch (e) { setError(e.response?.data?.error || e.message); } finally { setCargando(false); }
  };
  const copiar = async () => { await navigator.clipboard.writeText(propuestaTexto(p, st.cliente)); toast({ title: 'Propuesta copiada' }); };

  return (
    <Panel title="Propuesta" icon={Calculator}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">Plazo<Select value={plazo} onValueChange={setPlazo}><SelectTrigger className="mt-1 h-11 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{['12', '24', '36'].map((x) => <SelectItem key={x} value={x}>{x} meses</SelectItem>)}</SelectContent></Select></label>
        <label className="text-sm">Paquete<Select value={paquete} onValueChange={setPaquete}><SelectTrigger className="mt-1 h-11 w-56"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="ninguno">Sin paquete</SelectItem>{cat.paquetes.map((q) => <SelectItem key={q.id_paquete} value={q.id_paquete}>{q.id_paquete} · {q.nombre}{q.id_paquete === st.ia.paquete_sugerido ? ' (sugerido)' : ''}</SelectItem>)}</SelectContent></Select></label>
        <label className="text-sm">Descuento extra %<Input type="number" min="0" max="100" value={extra} onChange={(e) => setExtra(e.target.value)} className="mt-1 h-11 w-32" /></label>
        <Button onClick={generar} disabled={cargando || !d.productos.length} className="h-11">{cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}Generar propuesta</Button>
        {p && <Button variant="outline" onClick={copiar} className="h-11"><Copy className="h-4 w-4" />Copiar propuesta</Button>}
      </div>
      {!d.productos.length && <p className="text-muted-foreground">Confirma productos en la conversación para cotizar.</p>}
      {error && <p className="mb-3 text-destructive">{error}</p>}
      {p?.requiere_autorizacion && <div className="mb-4 flex gap-2 rounded-xl bg-warning/15 p-3 text-sm"><AlertTriangle className="h-4 w-4 shrink-0" /><div><b>Pendiente de autorización.</b> {p.mensajes.join(' ')}</div></div>}
      {p && <PropuestaDesglose p={p} />}
    </Panel>
  );
}