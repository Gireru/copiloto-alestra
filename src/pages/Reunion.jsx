import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useCatalog, analizarTexto } from '@/lib/catalog';
import { evaluarReglas } from '@/lib/rules';
import ConversationPanel from '@/components/meeting/ConversationPanel';
import CopilotPanel from '@/components/meeting/CopilotPanel';
import ControlPanel from '@/components/meeting/ControlPanel';

export default function Reunion() {
  const { data: cat } = useCatalog();
  const navigate = useNavigate();
  const [sesion, setSesion] = useState(null);
  const [cliente, setCliente] = useState('');
  const [caso, setCaso] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [analisis, setAnalisis] = useState(null);
  const [bloqueadas, setBloqueadas] = useState(0);
  const [analizando, setAnalizando] = useState(false);
  const ultimo = useRef('');
  const creado = useRef(false);

  const nueva = async () => {
    const s = await base44.entities.Sesion.create({ inicio: new Date().toISOString(), inventadas_bloqueadas: 0 });
    localStorage.setItem('sesionActual', s.id);
    setSesion(s); setTranscript(''); setAnalisis(null); setBloqueadas(0); setCliente(''); setCaso(null); ultimo.current = '';
  };
  useEffect(() => { if (!creado.current) { creado.current = true; nueva(); } }, []);

  const resultado = useMemo(() => cat && analisis
    ? evaluarReglas(analisis.datos_extraidos, analisis.productos_candidatos, cat.productosMap, transcript)
    : { reglas: [], tipo: 'estándar' }, [analisis, cat]);

  const analizar = async () => {
    const texto = transcript.trim();
    if (!texto || analizando || !sesion) return;
    ultimo.current = texto; setAnalizando(true);
    try {
      const r = await analizarTexto(texto);
      const total = bloqueadas + (r.bloqueadas || 0);
      const { reglas, tipo } = evaluarReglas(r.datos_extraidos, r.productos_candidatos, cat.productosMap, texto);
      setAnalisis(r); setBloqueadas(total);
      await base44.entities.Sesion.update(sesion.id, {
        cliente, industria: caso?.industria || r.datos_extraidos?.industria || '', empleados: caso?.empleados || null,
        transcripcion: texto, productos_candidatos: r.productos_candidatos, paquete_sugerido: r.paquete_sugerido,
        preguntas_siguientes: r.preguntas_siguientes, respuestas_sugeridas: r.respuestas_sugeridas,
        datos_extraidos: r.datos_extraidos, checklist: r.checklist, reglas_disparadas: reglas, tipo_de_caso: tipo, inventadas_bloqueadas: total
      });
    } finally { setAnalizando(false); }
  };

  useEffect(() => {
    if (!transcript.trim() || transcript.trim() === ultimo.current || analizando) return;
    const t = setTimeout(analizar, 4000);
    return () => clearTimeout(t);
  }, [transcript, analizando]);

  const generar = async () => {
    await base44.entities.Sesion.update(sesion.id, { fin: new Date().toISOString(), cliente });
    navigate(`/propuesta?sesion=${sesion.id}`);
  };

  if (!cat || !sesion) return <div className="grid h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const paquete = cat.paquetes.find((p) => p.id_paquete === analisis?.paquete_sugerido);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Reunión en vivo</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={nueva} className="h-12 text-base"><RotateCcw className="mr-2 h-4 w-4" />Nueva reunión</Button>
          <Button variant="secondary" onClick={analizar} disabled={analizando || !transcript.trim()} className="h-12 text-base"><Zap className="mr-2 h-4 w-4" />Analizar ahora</Button>
          <Button onClick={generar} disabled={!analisis?.productos_candidatos?.length || analizando} className="h-12 text-base"><FileText className="mr-2 h-4 w-4" />Generar propuesta</Button>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr_1fr]">
        <ConversationPanel transcript={transcript} cliente={cliente} setCliente={setCliente} casos={cat.casos}
          onAppend={(t) => setTranscript((p) => (p ? p + '\n' : '') + t)} onReplace={setTranscript}
          onCargarCaso={(c) => { setCaso(c); setCliente(c.empresa); setTranscript(c.mensaje_inicial); }} />
        <CopilotPanel analisis={analisis} analizando={analizando} productosMap={cat.productosMap} paquete={paquete} bloqueadas={bloqueadas} />
        <ControlPanel checklist={analisis?.checklist || []} tipo={resultado.tipo} reglas={resultado.reglas} inicio={sesion.inicio} />
      </div>
    </div>
  );
}