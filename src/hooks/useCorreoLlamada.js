import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Carga el correo del cliente (?correo=id) y precarga sus datos en la sesión.
export default function useCorreoLlamada(r) {
  const [correo, setCorreo] = useState(null);
  const [id] = useState(() => new URLSearchParams(window.location.search).get('correo'));
  useEffect(() => { if (id) base44.entities.Correo.get(id).then(setCorreo); }, [id]);
  useEffect(() => {
    if (correo && r.st && !r.st.cliente) r.set({ cliente: correo.empresa, industria: correo.industria, empleados: correo.empleados });
  }, [correo, r.st?.id]);
  return correo;
}