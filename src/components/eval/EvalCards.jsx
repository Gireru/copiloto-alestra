const Card = ({ label, value, tone = 'text-foreground' }) => (
  <div className="rounded-2xl border bg-card p-5 shadow-sm">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-4xl font-extrabold tabular-nums ${tone}`}>{value}</p>
  </div>
);

export default function EvalCards({ res }) {
  const n = res.length || 1;
  const ok = res.filter((r) => r.ok).length;
  const sinArq = res.filter((r) => r.tipo === 'estándar').length;
  const prom = res.reduce((a, r) => a + r.ms, 0) / n / 1000;
  const bloq = res.reduce((a, r) => a + r.bloqueadas, 0);
  const malos = res.reduce((a, r) => a + r.preciosMal, 0);
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Card label="Clasificación correcta" value={`${Math.round((ok / n) * 100)}%`} tone="text-primary" />
      <Card label="Casos sin arquitecto" value={`${Math.round((sinArq / n) * 100)}%`} />
      <Card label="Tiempo promedio" value={`${prom.toFixed(1)} s`} />
      <Card label="Respuestas inventadas bloqueadas" value={bloq} />
      <Card label="Precios incorrectos" value={malos} tone={malos === 0 ? 'text-success' : 'text-destructive'} />
    </div>
  );
}