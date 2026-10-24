export default function Panel({ title, icon: Icon, children, right, className = '' }) {
  return (
    <section className={`rounded-3xl border bg-card p-6 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl">
          {Icon && <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />}{title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}