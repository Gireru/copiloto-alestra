import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mxn, esConsumo, tieneCantidad, clamp } from '@/lib/quote';

export default function QuoteLines({ calc, lineas, setLineas, productosMap }) {
  const upd = (sku, patch) => setLineas(lineas.map((l) => (l.sku === sku ? { ...l, ...patch } : l)));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base">
        <thead><tr className="border-b text-left text-sm text-muted-foreground">
          <th className="py-2 pr-3">Producto</th><th className="py-2 pr-3">Cantidad</th><th className="py-2 pr-3 text-right">Precio unit.</th>
          <th className="py-2 pr-3 text-right">Desc.</th><th className="py-2 pr-3 text-right">Mensual neto</th><th className="py-2 pr-3 text-right">Cargo único</th><th />
        </tr></thead>
        <tbody>
          {calc.filas.map((f) => {
            const p = productosMap[f.sku];
            const l = lineas.find((x) => x.sku === f.sku);
            return (
              <tr key={f.sku} className="border-b align-middle">
                <td className="py-3 pr-3">
                  <p className="font-semibold">{f.nombre}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-mono">{f.sku}</span> · {f.unidad}{p.cantidad_minima > 1 ? ` · mín. ${p.cantidad_minima}` : ''}</p>
                  {f.estimado && <span className="mt-1 inline-block rounded bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">Estimado</span>}
                  {f.paquete && <span className="ml-1 mt-1 inline-block rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{f.paquete}</span>}
                </td>
                {f.medida ? <td colSpan={5} className="py-3 pr-3 font-medium text-primary">Lo cotiza un arquitecto de soluciones</td> : <>
                  <td className="py-3 pr-3">
                    {esConsumo(p) ? <Input type="number" min={0} value={l.consumo ?? ''} placeholder="Consumo MXN/mes" onChange={(e) => upd(f.sku, { consumo: e.target.value })} className="h-10 w-36" />
                      : tieneCantidad(p) ? <Input type="number" min={p.cantidad_minima || 1} value={l.cantidad} onChange={(e) => upd(f.sku, { cantidad: e.target.value === '' ? '' : Number(e.target.value) })} onBlur={() => upd(f.sku, { cantidad: clamp(p, l.cantidad) })} className="h-10 w-24" />
                      : <span className="text-muted-foreground">1</span>}
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums">{f.precioUnit !== null ? mxn(f.precioUnit) : f.cargoUnit ? mxn(f.cargoUnit) : '—'}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{f.mensual ? `${f.descPct}%` : '—'}</td>
                  <td className="py-3 pr-3 text-right font-semibold tabular-nums">{f.mensual ? mxn(f.mensual * (1 - f.descPct / 100)) : '—'}</td>
                  <td className="py-3 pr-3 text-right tabular-nums">{f.unico ? mxn(f.unico) : '—'}</td>
                </>}
                <td className="py-3"><Button variant="ghost" size="icon" onClick={() => setLineas(lineas.filter((x) => x.sku !== f.sku))}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}