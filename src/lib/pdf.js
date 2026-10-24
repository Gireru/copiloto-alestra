import { jsPDF } from 'jspdf';
import { mxn } from '@/lib/quote';

function writer() {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  let y = 20;
  const W = 175;
  const ensure = (h) => { if (y + h > 265) { doc.addPage(); y = 20; } };
  const text = (s, { size = 10, bold = false, color = [30, 41, 59], gap = 2 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color);
    doc.splitTextToSize(String(s ?? ''), W).forEach((ln) => { ensure(size * 0.45); doc.text(ln, 20, y); y += size * 0.45; });
    y += gap;
  };
  const row = (cols, xs, { bold = false, size = 9 } = {}) => {
    ensure(6); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(30, 41, 59);
    const lines = cols.map((c, i) => doc.splitTextToSize(String(c ?? ''), (xs[i + 1] || 195) - xs[i] - 2));
    const h = Math.max(...lines.map((l) => l.length)) * 4;
    lines.forEach((l, i) => doc.text(l, xs[i], y));
    y += h + 1.5;
  };
  const rule = () => { doc.setDrawColor(203, 213, 225); doc.line(20, y - 2, 195, y - 2); y += 2; };
  const cover = (titulo, sub) => {
    doc.setFillColor(29, 78, 216); doc.rect(0, 0, 216, 279, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(34); doc.text(titulo, 20, 120);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(14); doc.splitTextToSize(sub, 175).forEach((l, i) => doc.text(l, 20, 135 + i * 7));
    doc.addPage(); y = 20;
  };
  return { doc, text, row, rule, cover, space: (h) => { y += h; } };
}

export function propuestaPDF({ cliente, parrafo, calc, plazo, vigencia, diferir, condiciones }) {
  const w = writer();
  w.cover('Propuesta Alestra', `${cliente || 'Cliente'} · ${new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}`);
  w.text('Lo que nos compartió', { size: 15, bold: true, gap: 3 });
  w.text(parrafo, { size: 11, gap: 6 });
  w.text(`Propuesta económica · Plazo ${plazo} meses`, { size: 15, bold: true, gap: 3 });
  const xs = [20, 88, 108, 133, 150, 173];
  w.row(['Producto', 'Cantidad', 'Precio unit.', 'Desc.', 'Mensual', 'Cargo único'], xs, { bold: true }); w.rule();
  calc.filas.forEach((f) => {
    if (f.medida) return w.row([`${f.nombre} (${f.sku})`, 'Lo cotiza un arquitecto de soluciones'], [20, 88]);
    w.row([`${f.nombre} (${f.sku})${f.estimado ? ' · Estimado' : ''}`, f.cantidad ?? '—', f.precioUnit !== null ? mxn(f.precioUnit) : '—', `${f.descPct}%`, mxn(f.mensual * (1 - f.descPct / 100)), f.unico ? mxn(f.unico) : '—'], xs);
  });
  w.rule(); w.space(2);
  const tot = [['Subtotal mensual', calc.subtotal], ['Descuentos', -calc.descuentos], ['IVA 16%', calc.iva], ['Total mensual', calc.totalMensual], ['Cargos únicos (con IVA)', calc.totalUnicos]];
  tot.forEach(([k, v], i) => w.row([k, mxn(v)], [110, 160], { bold: i === 3 }));
  if (diferir && calc.unicos) w.text(`Cargos únicos diferidos en 3 mensualidades de ${mxn(calc.totalUnicos / 3)} (con IVA).`, { size: 9 });
  w.space(4);
  w.text('Condiciones', { size: 15, bold: true, gap: 3 });
  condiciones.forEach((c) => w.text(`• ${c.concepto}: ${c.regla}`, { size: 9, gap: 1 }));
  w.space(3);
  w.text(`Vigencia de la propuesta: hasta el ${vigencia} (30 días naturales).`, { size: 10, bold: true });
  w.text('Precios verificados contra catálogo.', { size: 9, color: [21, 128, 61] });
  w.doc.save(`Propuesta-Alestra-${(cliente || 'cliente').replace(/\s+/g, '-')}.pdf`);
}

export function expedientePDF({ cliente, expediente, reglas, transcripcion }) {
  const w = writer();
  w.cover('Expediente para arquitecto', `${cliente || 'Cliente'} · ${new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}`);
  w.text('Resumen del cliente', { size: 14, bold: true }); w.text(expediente.resumen, { size: 10, gap: 5 });
  w.text('Reglas disparadas', { size: 14, bold: true });
  reglas.forEach((r) => w.text(`• ${r.id}: ${r.motivo} → ${r.partes.join(', ')}`, { size: 10, gap: 1 })); w.space(4);
  w.text('Lo que ya se preguntó (no repetir)', { size: 14, bold: true });
  expediente.ya_preguntado.forEach((s) => w.text(`• ${s}`, { size: 10, gap: 1 })); w.space(4);
  w.text('Preguntas técnicas pendientes', { size: 14, bold: true });
  expediente.preguntas_tecnicas.forEach((s) => w.text(`• ${s}`, { size: 10, gap: 1 })); w.space(4);
  w.text('Transcripción', { size: 14, bold: true }); w.text(transcripcion, { size: 9 });
  w.doc.save(`Expediente-${(cliente || 'cliente').replace(/\s+/g, '-')}.pdf`);
}