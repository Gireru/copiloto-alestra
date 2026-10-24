import { useState } from 'react';
import { Briefcase, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { expedientePDF } from '@/lib/pdf';
import EnviarArquitecto from './EnviarArquitecto';

export default function ExpedienteCard({ sesion, productosMap, expediente, setExpediente }) {
  const [cargando, setCargando] = useState(false);
  const reglas = sesion.reglas_disparadas || [];
  const datosPDF = { cliente: sesion.cliente, expediente, reglas, transcripcion: sesion.transcripcion };
  const generar = async () => {
    setCargando(true);
    try {
      const res = await base44.functions.invoke('generarExpediente', {
        transcripcion: sesion.transcripcion, cliente: sesion.cliente, reglas, datos: sesion.datos_extraidos,
        preguntas_hechas: (sesion.preguntas_siguientes || []).map((p) => p.pregunta),
        productos: (sesion.productos_candidatos || []).map((c) => productosMap[c.sku]?.nombre)
      });
      setExpediente(res.data);
    } finally { setCargando(false); }
  };
  return (
    <div className="rounded-2xl border-2 border-warning/40 bg-card p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Briefcase className="h-5 w-5 text-warning" />Expediente para el arquitecto</h2>
      <p className="mt-1 text-sm text-muted-foreground">La parte estándar se cotiza ya. Al arquitecto solo le llega: {reglas.map((r) => r.id).join(', ')}.</p>
      {expediente && (
        <div className="mt-3 space-y-2 text-sm">
          <p>{expediente.resumen}</p>
          <p className="font-semibold">Preguntas técnicas pendientes</p>
          <ul className="list-disc pl-5">{expediente.preguntas_tecnicas.map((q) => <li key={q}>{q}</li>)}</ul>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button onClick={generar} disabled={cargando} variant="outline">{cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{expediente ? 'Regenerar' : 'Generar expediente'}</Button>
        {expediente && <Button onClick={() => expedientePDF(datosPDF)}><Download className="mr-2 h-4 w-4" />Descargar PDF</Button>}
      </div>
      {expediente && <EnviarArquitecto sesionId={sesion.id} crearPDF={() => expedientePDF({ ...datosPDF, descargar: false })} />}
    </div>
  );
}