import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useCatalog, versionCatalogo } from '@/lib/catalog';
import { calcular, cantidadInicial, faltantes, recomendados, verificarPrecios } from '@/lib/quote';
import { propuestaPDF } from '@/lib/pdf';
import Panel from '@/components/meeting/Panel';
import QuoteLines from '@/components/proposal/QuoteLines';
import QuoteTotals from '@/components/proposal/QuoteTotals';
import Avisos from '@/components/proposal/Avisos';
import ExpedienteCard from '@/components/proposal/ExpedienteCard';

const vigenciaFecha = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d; };

export default function Propuesta() {
  const { data: cat } = useCatalog();
  const id = new URLSearchParams(window.location.search).get('sesion') || localStorage.getItem('sesionActual');
  const [sesion, setSesion] = useState(undefined);
  const [lineas, setLineas] = useState([]);
  const [plazo, setPlazo] = useState(12);
  const [paqCuenta, setPaqCuenta] = useState(true);
  const [diferir, setDiferir] = useState(false);
  const [estado, setEstado] = useState(null);
  const [expediente, setExpediente] = useState(null);

  useEffect(() => { if (!id) { setSesion(null); return; } base44.entities.Sesion.get(id).then(setSesion, () => setSesion(null)); }, [id]);
  useEffect(() => {
    if (!cat || !sesion) return;
    setLineas((sesion.productos_candidatos || []).filter((c) => cat.productosMap[c.sku]).map((c) => ({ sku: c.sku, cantidad: cantidadInicial(cat.productosMap[c.sku], sesion.datos_extraidos), consumo: '' })));
  }, [cat, sesion]);

  const calc = useMemo(() => cat && calcular({ lineas, plazo, productosMap: cat.productosMap, paquetes: cat.paquetes, paqueteCuentaEnLimite: paqCuenta }), [cat, lineas, plazo, paqCuenta]);
  if (!cat || sesion === undefined) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!sesion?.productos_candidatos?.length) return <div className="py-24 text-center"><p className="text-xl text-muted-foreground">Primero analiza una reunión para prellenar la propuesta.</p><Link to="/" className="mt-4 inline-block text-primary underline">Ir a Reunión en vivo</Link></div>;

  const agregar = (sku) => !lineas.some((l) => l.sku === sku) && setLineas([...lineas, { sku, cantidad: cantidadInicial(cat.productosMap[sku], sesion.datos_extraidos), consumo: '' }]);
  const escalado = ['mixto', 'a la medida'].includes(sesion.tipo_de_caso);

  const generarPDF = async () => {
    setEstado({ cargando: true });
    const fresco = await base44.entities.Producto.list('sku', 100);
    const malos = verificarPrecios(calc.filas, fresco);
    if (malos.length) { setEstado({ error: `Precios no coinciden con el catálogo: ${malos.map((m) => m.sku).join(', ')}` }); return; }
    setEstado({ verificado: true, cargando: true });
    const parrafo = sesion.resumen_cliente || (await base44.functions.invoke('redactarNecesidad', { transcripcion: sesion.transcripcion, cliente: sesion.cliente })).data.parrafo;
    const vig = vigenciaFecha();
    const cv = versionCatalogo(fresco);
    propuestaPDF({ cliente: sesion.cliente, parrafo, calc, plazo, diferir, condiciones: cat.condiciones, vigencia: vig.toLocaleDateString('es-MX', { dateStyle: 'long' }), catalogo: cv });
    await base44.entities.Propuesta.create({
      sesion: sesion.id, lineas: calc.filas, plazo_meses: plazo, subtotal_mensual: calc.subtotal, descuentos: calc.descuentos, iva: calc.iva,
      total_mensual: calc.totalMensual, cargos_unicos: calc.unicos, requiere_autorizacion: calc.requiereAutorizacion, vigencia: vig.toISOString().slice(0, 10), expediente_arquitecto: expediente, catalogo_version: cv.version, catalogo_fecha: cv.fecha
    });
    setEstado({ verificado: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Propuesta</h1><p className="text-lg text-muted-foreground">{sesion.cliente || 'Cliente sin nombre'} · Vigencia 30 días naturales</p></div>
        <div className="flex items-center gap-3">
          {estado?.verificado && <span className="flex items-center gap-1.5 font-semibold text-success"><CheckCircle2 className="h-5 w-5" />✓ Precios verificados contra catálogo</span>}
          <Button onClick={generarPDF} disabled={estado?.cargando} className="h-12 text-base">{estado?.cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Generar PDF</Button>
        </div>
      </div>
      {estado?.error && <p className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-destructive"><AlertTriangle className="h-4 w-4" />{estado.error}</p>}
      <div className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-5">
          <Panel title="Productos" right={
            <div className="flex rounded-lg bg-muted p-1">{[12, 24, 36].map((m) => <button key={m} onClick={() => setPlazo(m)} className={`rounded-md px-4 py-1.5 text-base font-semibold transition ${plazo === m ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>{m} meses</button>)}</div>}>
            <QuoteLines calc={calc} lineas={lineas} setLineas={setLineas} productosMap={cat.productosMap} />
            <div className="mt-5"><Avisos faltan={faltantes(lineas, cat.productosMap)} recs={recomendados(lineas, cat.productosMap)} onAgregar={agregar} /></div>
          </Panel>
          {escalado && <ExpedienteCard sesion={sesion} productosMap={cat.productosMap} expediente={expediente} setExpediente={setExpediente} />}
        </div>
        <Panel title="Resumen (MXN)"><QuoteTotals calc={calc} paqCuenta={paqCuenta} setPaqCuenta={setPaqCuenta} diferir={diferir} setDiferir={setDiferir} /></Panel>
      </div>
    </div>
  );
}