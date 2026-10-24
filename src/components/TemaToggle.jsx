import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function TemaToggle() {
  const [oscuro, setOscuro] = useState(() => localStorage.getItem('tema') === 'oscuro');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro);
    localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro');
  }, [oscuro]);
  return (
    <button onClick={() => setOscuro(!oscuro)} aria-label="Cambiar tema" className="grid h-9 w-9 place-items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent">
      {oscuro ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  );
}