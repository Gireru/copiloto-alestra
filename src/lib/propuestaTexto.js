import { mxn } from '@/lib/quote';

export function propuestaTexto(p, cliente) {
  const l = p.lineas.map((x) => {
    const monto = x.nota && !x.mensual && !x.cargo_unico ? x.nota : [x.mensual ? `${mxn(x.mensual_neto)}/mes` : '', x.cargo_unico ? `${mxn(x.cargo_unico)} único` : ''].filter(Boolean).join(' + ');
    return `• ${x.nombre}${x.cantidad ? ` (${x.cantidad})` : ''}: ${monto}`;
  });
  return [
    `Propuesta Alestra${cliente ? ` para ${cliente}` : ''}`,
    `Plazo: ${p.plazo_meses} meses`, '', ...l, '',
    `Subtotal mensual: ${mxn(p.subtotal_mensual)}`,
    `Descuentos: -${mxn(p.descuentos)} (${p.descuento_total_pct}%)`,
    `Subtotal con descuento: ${mxn(p.subtotal_con_descuento)}`,
    `IVA 16%: ${mxn(p.iva)}`,
    `Total mensual con IVA: ${mxn(p.total_mensual)}`,
    p.cargos_unicos ? `Cargos únicos con IVA: ${mxn(p.cargos_unicos_total)} (${p.nota_cargos_unicos})` : '',
    `Vigencia: ${p.vigencia}`,
    p.requiere_autorizacion ? `Estado: Pendiente de autorización. ${p.mensajes.join(' ')}` : ''
  ].filter((x) => x !== null).join('\n').trim();
}