export default function Glass({ titulo, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-xl ${className}`}>
      {titulo && <p className="eyebrow mb-3 text-sidebar-foreground/70">{titulo}</p>}
      {children}
    </section>
  );
}