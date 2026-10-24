import { mxn } from '@/lib/quote';

const Fila = ({ l, v, b }) => <div className={`flex justify-between ${b ? 'text-lg font-semibold' : ''}`}><span>{l}</span><span className="tabular-nums">{v}</span></div>;

export default function PropuestaDesglose({ p }) {
  const d = p.desglose_descuentos;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <ul className="divide-y rounded-2xl border">
        {p.lineas.map((x) => (
          <li key={x.sku} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
            <div><p className="font-semibold">{x.nombre} {x.origen === 'requisito' && <span className="ml-1 rounded-full bg-accent px-2 text-xs text-accent-foreground">requisito</span>}</p>
              <p className="text-muted-foreground">{x.sku}{x.cantidad ? ` · ${x.cantidad} × ${mxn(x.precio_unitario)}` : ''}</p></div>
            <div className="text-right">
              {x.nota && !x.mensual && !x.cargo_unico ? <p className="italic text-muted-foreground">{x.nota}</p> : <>
                {x.mensual > 0 && <p>{mxn(x.mensual_neto)}/mes <span className="text-muted-foreground line-through">{mxn(x.mensual)}</span></p>}
                {x.cargo_unico > 0 && <p className="text-muted-foreground">{mxn(x.cargo_unico)} único</p>}
              </>}
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 rounded-2xl bg-muted p-4 text-sm">
        <Fila l="Subtotal mensual" v={mxn(p.subtotal_mensual)} />
        <Fila l="Desc. por plazo" v={`-${mxn(d.plazo)}`} />
        <Fila l="Desc. de paquete" v={`-${mxn(d.paquete)}`} />
        <Fila l="Volumen Microsoft 365" v={`-${mxn(d.volumen)}`} />
        <Fila l="Desc. del vendedor" v={`-${mxn(d.vendedor)}`} />
        <Fila l={`Descuento total (${p.descuento_total_pct}%)`} v={`-${mxn(p.descuentos)}`} />
        <Fila l="Subtotal con descuento" v={mxn(p.subtotal_con_descuento)} />
        <Fila l="IVA 16%" v={mxn(p.iva)} />
        <Fila l="Total mensual con IVA" v={mxn(p.total_mensual)} b />
        {p.cargos_unicos > 0 && <><Fila l="Cargos únicos con IVA" v={mxn(p.cargos_unicos_total)} /><p className="text-xs text-muted-foreground">{p.nota_cargos_unicos}</p></>}
        <p className="pt-2 text-xs text-muted-foreground">Vigencia: {p.vigencia} · Catálogo {p.catalogo_version}</p>
      </div>
    </div>
  );
}