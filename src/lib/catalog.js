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

export async function analizarTexto(texto) {
  const res = await base44.functions.invoke('copilotAnalyze', { texto });
  return res.data;
}