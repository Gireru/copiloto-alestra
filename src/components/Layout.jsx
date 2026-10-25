import { NavLink, Outlet } from 'react-router-dom';
import { Radio, FileText, BarChart3, History, Sparkles, Video, Mail, BookOpen } from 'lucide-react';
import TemaToggle from '@/components/TemaToggle';

const links = [
  { to: '/', label: 'Reunión en vivo', icon: Radio },
  { to: '/correos', label: 'Correos', icon: Mail },
  { to: '/videollamada', label: 'Videollamada', icon: Video },
  { to: '/sesiones', label: 'Mis sesiones', icon: History },
  { to: '/propuesta', label: 'Propuesta', icon: FileText },
  { to: '/evaluacion', label: 'Evaluación', icon: BarChart3 },
  { to: '/visualizador', label: 'Visualizador IA', icon: Sparkles },
  { to: '/criterios', label: 'Criterios', icon: BookOpen }
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="z-30 flex shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-60">
        <div className="flex items-center justify-between gap-3 px-4 py-2 lg:block lg:px-5 lg:py-6">
          <div className="flex items-center gap-3 lg:block">
            <img src="/brand/alestra-logo-blanco.png" alt="Alestra" className="h-auto w-[80px] lg:w-[110px]" />
            <p className="eyebrow text-sidebar-foreground/70 lg:mt-2">Copiloto comercial</p>
          </div>
          <div className="lg:hidden"><TemaToggle /></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none] px-3 pb-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 whitespace-nowrap rounded-lg border-l-[3px] px-3 py-2 text-sm lg:py-2.5 lg:text-[15px] font-medium transition-colors ${isActive ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground' : 'border-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'}`}>
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