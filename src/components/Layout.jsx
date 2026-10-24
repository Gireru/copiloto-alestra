import { NavLink, Outlet } from 'react-router-dom';
import { Radio, FileText, BarChart3, History, Sparkles } from 'lucide-react';
import TemaToggle from '@/components/TemaToggle';

const links = [
  { to: '/', label: 'Reunión en vivo', icon: Radio },
  { to: '/sesiones', label: 'Mis sesiones', icon: History },
  { to: '/propuesta', label: 'Propuesta', icon: FileText },
  { to: '/evaluacion', label: 'Evaluación', icon: BarChart3 },
  { to: '/visualizador', label: 'Visualizador IA', icon: Sparkles }
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="z-30 flex shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-60">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:py-6">
          <div>
            <img src="/brand/alestra-logo-blanco.png" alt="Alestra" className="h-auto w-[110px]" />
            <p className="eyebrow mt-2 text-sidebar-foreground/70">Copiloto comercial</p>
          </div>
          <div className="lg:hidden"><TemaToggle /></div>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-3 lg:flex-1 lg:flex-col">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 whitespace-nowrap rounded-lg border-l-[3px] px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground' : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center justify-between border-t border-sidebar-border px-5 py-4 lg:flex">
          <span className="text-xs text-sidebar-foreground/60">Powered by Claude</span>
          <TemaToggle />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8"><Outlet /></main>
    </div>
  );
}