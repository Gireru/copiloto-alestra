import { NavLink, Outlet } from 'react-router-dom';
import { Radio, FileText, BarChart3 } from 'lucide-react';

const links = [
  { to: '/', label: 'Reunión en vivo', icon: Radio },
  { to: '/propuesta', label: 'Propuesta', icon: FileText },
  { to: '/evaluacion', label: 'Evaluación', icon: BarChart3 }
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center gap-6 px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-heading font-extrabold">A</div>
            <span className="font-heading text-xl font-extrabold tracking-tight">Copiloto <span className="text-primary">Alestra</span></span>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-base font-medium transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1800px] px-4 py-6 md:px-6"><Outlet /></main>
    </div>
  );
}