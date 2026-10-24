import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { versionCatalogo } from '@/lib/catalog';
import { calcular, cantidadInicial, verificarPrecios } from '@/lib/quote';
import { propuestaPDF } from '@/lib/pdf';
import { useToast } from '@/components/ui/use-toast';

export default function CotizacionPDF({ st, d, cat }) {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();
  const descargar = async () => {
    setCargando(true);
    try {
      const lineas = d.productos.map((c) => ({ sku: c.sku, cantidad: cantidadInicial(cat.productosMap[c.sku], d.datos), consumo: '' }));
      const calc = calcular({ lineas, plazo: 12, productosMap: cat.productosMap, paquetes: cat.paquetes, paqueteCuentaEnLimite: true });
      const fresco = await base44.entities.Producto.list('sku', 100);
      const malos = verificarPrecios(calc.filas, fresco);
      if (malos.length) { toast({ title: 'Precios no coinciden con el catálogo', description: malos.map((m) => m.sku).join(', '), variant: 'destructive' }); return; }
      const parrafo = st.resumen_cliente || (await base44.functions.invoke('redactarNecesidad', { transcripcion: st.transcripcion, cliente: st.cliente })).data.parrafo;
      const vig = new Date(); vig.setDate(vig.getDate() + 30);
      propuestaPDF({ cliente: st.cliente, parrafo, calc, plazo: 12, diferir: false, condiciones: cat.condiciones, vigencia: vig.toLocaleDateString('es-MX', { dateStyle: 'long' }), catalogo: versionCatalogo(fresco) });
    } finally {
      setCargando(false);
    }
  };
  return (
    <Button variant="outline" onClick={descargar} disabled={cargando || !d.productos.length} title="Cotización rápida a 12 meses con los productos detectados" className="h-12 text-base">
      {cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Cotización PDF
    </Button>
  );
}