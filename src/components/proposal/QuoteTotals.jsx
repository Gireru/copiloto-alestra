import { AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { mxn } from '@/lib/quote';

const Fila = ({ k, v, strong }) => (
  <div className={`flex justify-between py-1.5 ${strong ? 'border-t pt-3 text-xl font-extrabold' : 'text-base'}`}><span>{k}</span><span className="tabular-nums">{v}</span></div>
);

export default function QuoteTotals({ calc, paqCuenta, setPaqCuenta, diferir, setDiferir }) {
  return (
    <div className="space-y-4">
      <div>
        <Fila k="Subtotal mensual" v={mxn(calc.subtotal)} />
        {calc.descPlazo > 0 && <Fila k={`Descuento por plazo (${calc.plazoPct}%)`} v={'−' + mxn(calc.descPlazo)} />}
        {calc.descPaquete > 0 && <Fila k={`Descuento de paquete (${calc.paquetes.map((p) => p.id_paquete).join(', ')})`} v={'−' + mxn(calc.descPaquete)} />}
        {calc.descVolumen > 0 && <Fila k="Volumen Microsoft 365 (3%)" v={'−' + mxn(calc.descVolumen)} />}
        <Fila k="IVA 16%" v={mxn(calc.iva)} />
        <Fila k="Total mensual" v={mxn(calc.totalMensual)} strong />
      </div>
      <div className="rounded-xl bg-muted p-4">
        <Fila k="Cargos únicos (sin descuento)" v={mxn(calc.unicos)} />
        <Fila k="Cargos únicos con IVA" v={mxn(calc.totalUnicos)} />
        <label className="mt-2 flex items-center justify-between text-sm">Diferir en 3 mensualidades<Switch checked={diferir} onCheckedChange={setDiferir} /></label>
        {diferir && calc.unicos > 0 && <p className="mt-1 text-sm text-muted-foreground">3 pagos de {mxn(calc.totalUnicos / 3)}</p>}
      </div>
      <div className="text-sm text-muted-foreground">
        Descuento total: <b className="text-foreground">{calc.pctTotal.toFixed(1)}%</b>
        <label className="mt-2 flex items-center justify-between">El descuento de paquete cuenta en el límite de 10%<Switch checked={paqCuenta} onCheckedChange={setPaqCuenta} /></label>
      </div>
      {calc.requiereAutorizacion && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive p-4 text-lg font-bold text-destructive-foreground"><AlertTriangle className="h-5 w-5" />Requiere autorización del gerente</div>
      )}
    </div>
  );
}