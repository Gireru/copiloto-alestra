import { Sparkles, Loader2, ShieldCheck, WifiOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Panel from './Panel';
import PreguntaCard from './PreguntaCard';
import ProductosTab from './ProductosTab';

export default function CopilotPanel({ r, cat, falla, analizando }) {
  const { st, d, set } = r;
  const hechas = new Set(st.preguntas_hechas);
  const preguntas = (st.ia.preguntas_siguientes || []).filter((p) => !hechas.has(p.pregunta));
  const marcar = (q) => set((p) => ({ preguntas_hechas: [...p.preguntas_hechas, q] }));
  const paquete = cat.paquetes.find((p) => p.id_paquete === st.ia.paquete_sugerido);
  const respuestas = st.ia.respuestas_sugeridas || [];
  return (
    <Panel title="Copiloto" icon={Sparkles} right={
      <div className="flex flex-wrap items-center justify-end gap-2">
        {analizando && <span className="flex items-center gap-1.5 text-sm text-primary"><Loader2 className="h-4 w-4 animate-spin" />Analizando</span>}
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />Inventadas bloqueadas: <b className="text-foreground">{st.inventadas_bloqueadas}</b></span>
      </div>}>
      {falla && <p className="mb-4 flex items-center gap-2 rounded-xl bg-warning/15 p-3 font-medium text-foreground"><WifiOff className="h-5 w-5 text-warning" />Copiloto no disponible, puedes seguir manualmente.</p>}
      <PreguntaCard preguntas={preguntas} preguntaCliente={st.ia.pregunta_cliente} onHecha={marcar} onNoAplica={marcar}
        onRespondida={() => set((p) => ({ ia: { ...p.ia, pregunta_cliente: null } }))} />
      <Tabs defaultValue={falla ? 'productos' : 'respuestas'} className="mt-5">
        <TabsList className="w-full"><TabsTrigger value="respuestas" className="flex-1">Respuestas</TabsTrigger><TabsTrigger value="productos" className="flex-1">Productos ({d.productos.length})</TabsTrigger><TabsTrigger value="paquete" className="flex-1">Paquete</TabsTrigger></TabsList>
        <TabsContent value="respuestas" className="space-y-2 pt-2">
          {!respuestas.length && <p className="text-muted-foreground">Sin respuestas sugeridas todavía.</p>}
          {respuestas.map((x, i) => <div key={i} className="flex items-start justify-between gap-3 rounded-xl border p-3"><p className="text-base">{x.texto}</p>{x.sku_fuente && <span className="shrink-0 rounded bg-secondary px-2 py-0.5 font-mono text-xs">{x.sku_fuente}</span>}</div>)}
        </TabsContent>
        <TabsContent value="productos" className="pt-2">
          <ProductosTab productos={d.productos} productosMap={cat.productosMap} catalogo={cat.productos}
            onDescartar={(sku) => set((p) => ({ descartados: [...p.descartados, sku], productos_manuales: p.productos_manuales.filter((s) => s !== sku) }))}
            onAgregar={(sku) => set((p) => ({ productos_manuales: [...p.productos_manuales, sku], descartados: p.descartados.filter((s) => s !== sku) }))} />
        </TabsContent>
        <TabsContent value="paquete" className="pt-2">
          {paquete ? <div className="rounded-xl bg-accent p-4"><p className="text-lg font-bold">{paquete.id_paquete} · {paquete.nombre}</p><p className="text-sm text-muted-foreground">{paquete.para_quien}</p><p className="mt-1 text-sm">{paquete.descuento_pct}% de descuento · {paquete.productos.join(', ')}</p></div>
            : <p className="text-muted-foreground">Ningún paquete aplica por ahora.</p>}
        </TabsContent>
      </Tabs>
    </Panel>
  );
}