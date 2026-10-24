import { useState } from 'react';
import { Mic, MicOff, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSpeech from '@/hooks/useSpeech';
import Panel from './Panel';
import SubirAudio from './SubirAudio';

export default function ConversationPanel({ transcript, onAppend, onFrase, onReplace, casos, onCargarCaso, cliente, setCliente }) {
  const [texto, setTexto] = useState('');
  const voz = useSpeech((t) => onFrase(t));
  const enviar = () => { if (texto.trim()) { onAppend(texto.trim()); setTexto(''); } };

  return (
    <Panel title="Conversación" icon={MessageSquare}>
      <div className="space-y-3">
        <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre del cliente" className="h-11 text-base" />
        <Select onValueChange={(id) => onCargarCaso(casos.find((c) => c.id === id))}>
          <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Cargar caso de prueba" /></SelectTrigger>
          <SelectContent>{casos.map((c) => <SelectItem key={c.id} value={c.id}>{c.id_caso} · {c.empresa}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={voz.alternar} disabled={!voz.soportado} variant={voz.escuchando ? 'destructive' : 'default'} className="h-14 w-full text-lg">
          {voz.escuchando ? <><MicOff className="mr-2 h-5 w-5" />Detener micrófono</> : <><Mic className="mr-2 h-5 w-5" />{voz.soportado ? 'Escuchar al cliente' : 'Micrófono no disponible'}</>}
        </Button>
        <SubirAudio onTexto={onFrase} />
        {voz.escuchando && <p className="flex items-center gap-2 text-sm text-destructive"><span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />Escuchando… {voz.parcial}</p>}
        <Textarea value={transcript} onChange={(e) => onReplace(e.target.value)} placeholder="Aquí aparece lo que dice el cliente…" className="min-h-[260px] text-lg leading-relaxed" />
        <div className="flex gap-2">
          <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), enviar())} placeholder="Escribe o pega lo que dijo el cliente" className="min-h-[56px] text-base" />
          <Button onClick={enviar} size="icon" className="h-14 w-14 shrink-0"><Send className="h-5 w-5" /></Button>
        </div>
      </div>
    </Panel>
  );
}