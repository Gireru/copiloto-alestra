import { useState } from 'react';
import { DATOS_DEF } from '@/lib/sesion';
import DatoChip from './DatoChip';

export default function DatosChips({ datos, manuales, onCambiar }) {
  const [todos, setTodos] = useState(false);
  const visibles = DATOS_DEF.filter((d) => todos || datos[d.key] !== undefined);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibles.map((def) => <DatoChip key={def.key} def={def} valor={datos[def.key]} manual={def.key in manuales} onCambiar={(v) => onCambiar(def.key, v)} />)}
        {!visibles.length && <p className="text-sm text-muted-foreground">Aún no hay datos capturados.</p>}
      </div>
      <button onClick={() => setTodos(!todos)} className="mt-2 text-sm font-medium text-primary hover:underline">{todos ? 'Ver solo los capturados' : '+ Agregar dato'}</button>
    </div>
  );
}