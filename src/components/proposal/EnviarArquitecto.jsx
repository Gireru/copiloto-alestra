import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function EnviarArquitecto({ sesionId, crearPDF }) {
  const [para, setPara] = useState('');
  const [estado, setEstado] = useState(null);
  const enviar = async () => {
    setEstado({ cargando: true });
    const pdf_base64 = crearPDF().output('datauristring').split(',')[1];
    try {
      await base44.functions.invoke('enviarExpediente', { sesion_id: sesionId, para, pdf_base64 });
      setEstado({ ok: true });
    } catch (e) {
      setEstado({ error: e.response?.data?.error || 'No se pudo enviar' });
    }
  };
  return (
    <div className="mt-4 border-t pt-4">
      <p className="mb-2 text-sm font-semibold">Enviar al arquitecto</p>
      <div className="flex flex-wrap gap-2">
        <Input type="email" value={para} onChange={(e) => setPara(e.target.value)} placeholder="correo del arquitecto" className="h-10 max-w-xs" />
        <Button onClick={enviar} disabled={!para.includes('@') || estado?.cargando}>{estado?.cargando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Enviar al arquitecto</Button>
      </div>
      {estado?.ok && <p className="mt-2 flex items-center gap-1 text-sm text-success"><CheckCircle2 className="h-4 w-4" />Expediente enviado.</p>}
      {estado?.error && <p className="mt-2 text-sm text-destructive">{estado.error}</p>}
      <p className="mt-1 text-xs text-muted-foreground">El arquitecto debe ser usuario de la app.</p>
    </div>
  );
}