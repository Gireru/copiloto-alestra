import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useCatalog() {
  return useQuery({
    queryKey: ['catalogo'],
    staleTime: Infinity,
    queryFn: async () => {
      const E = base44.entities;
      const [productos, paquetes, casos, condiciones] = await Promise.all([
        E.Producto.list('sku', 100), E.Paquete.list('id_paquete', 50), E.CasoCliente.list('id_caso', 50), E.CondicionComercial.list('created_date', 50)
      ]);
      return { productos, paquetes, casos, condiciones, productosMap: Object.fromEntries(productos.map((p) => [p.sku, p])) };
    }
  });
}

export async function analizarTexto(texto, extra = {}) {
  const res = await base44.functions.invoke('copilotAnalyze', { texto, ...extra });
  return res.data;
}

// Versión del catálogo: fecha del último cambio + huella de SKUs y precios.
export function versionCatalogo(productos) {
  const fecha = productos.reduce((m, p) => (p.updated_date > m ? p.updated_date : m), '');
  const s = productos.map((p) => `${p.sku}:${p.precio_mensual_mxn}:${p.cargo_unico_mxn}`).sort().join('|');
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return { version: `v${h.toString(36).toUpperCase().slice(0, 6)}`, fecha };
}