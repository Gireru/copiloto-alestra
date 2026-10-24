import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { cotizar, completarRequisitos, versionCatalogo, PLAZO_PCT } from '../../shared/cotizador.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const plazo = Number(body.plazo_meses);
    if (!(plazo in PLAZO_PCT)) return Response.json({ error: 'El plazo debe ser 12, 24 o 36 meses.' }, { status: 400 });
    const extraPct = Math.min(Math.max(Number(body.descuento_extra_pct) || 0, 0), 100);
    const entrada = Array.isArray(body.productos) ? body.productos.slice(0, 60) : [];
    if (!entrada.length) return Response.json({ error: 'Agrega al menos un producto.' }, { status: 400 });

    const [productos, paquetes] = await Promise.all([base44.entities.Producto.list('sku', 100), base44.entities.Paquete.list('id_paquete', 50)]);
    const map = Object.fromEntries(productos.map((p) => [p.sku, p]));
    const desconocidos = entrada.filter((l) => !map[l?.sku]).map((l) => l?.sku);
    if (desconocidos.length) return Response.json({ error: `SKU fuera del catálogo: ${desconocidos.join(', ')}` }, { status: 400 });

    const unicos = [...new Map(entrada.map((l) => [l.sku, { sku: l.sku, cantidad: Number(l.cantidad) || 1, consumo_estimado: l.consumo_estimado }])).values()];
    const { lineas, errores } = completarRequisitos(unicos, map);
    if (errores.length) return Response.json({ error: errores.join(' ') }, { status: 400 });

    let paquete = null;
    if (body.paquete) {
      paquete = paquetes.find((q) => q.id_paquete === body.paquete);
      if (!paquete) return Response.json({ error: `Paquete ${body.paquete} no existe.` }, { status: 400 });
      const s = new Set(lineas.map((l) => l.sku));
      if (!paquete.productos.every((x) => s.has(x))) return Response.json({ error: `El paquete ${paquete.id_paquete} requiere todos sus productos: ${paquete.productos.join(', ')}.` }, { status: 400 });
    }

    const r = cotizar({ lineas, map, paquete, plazo, extraPct });
    const { version, fecha } = versionCatalogo(productos);
    const vig = new Date(); vig.setDate(vig.getDate() + 30);
    const registro = {
      sesion: body.sesion ? String(body.sesion) : '', lineas: r.lineas, plazo_meses: plazo, paquete: paquete?.id_paquete || null,
      subtotal_mensual: r.subtotal_mensual, descuentos: r.descuentos, desglose_descuentos: r.desglose_descuentos, descuento_total_pct: r.descuento_total_pct,
      descuento_extra_pct: extraPct, subtotal_con_descuento: r.subtotal_con_descuento, iva: r.iva, total_mensual: r.total_mensual,
      cargos_unicos: r.cargos_unicos, cargos_unicos_total: r.cargos_unicos_total, nota_cargos_unicos: r.nota_cargos_unicos,
      requiere_autorizacion: r.requiere_autorizacion, estado: r.requiere_autorizacion ? 'pendiente_autorizacion' : 'lista',
      mensajes: r.mensajes, vigencia: vig.toISOString().slice(0, 10), expediente_arquitecto: body.expediente_arquitecto || null,
      catalogo_version: version, catalogo_fecha: fecha || null
    };
    const guardada = await base44.entities.Propuesta.create(registro);
    return Response.json({ id: guardada.id, ...registro });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}