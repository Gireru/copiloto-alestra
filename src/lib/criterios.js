import { Radio, Video, MessageCircleQuestion, ShieldCheck, Sparkles } from 'lucide-react';

export const PRINCIPIOS = [
  { n: '0', t: 'Preguntas inventadas', d: 'Todo sale del catálogo oficial.' },
  { n: '3', t: 'Preguntas a la vez', d: 'En la reunión en vivo, para no saturar.' },
  { n: '5', t: 'Preguntas en videollamada', d: 'Guía lateral siempre visible.' },
  { n: '10%', t: 'Tope de descuento', d: 'Arriba de eso requiere autorización.' }
];

export const BLOQUES = [
  { icon: Sparkles, eyebrow: 'Paso 1 · Detección', titulo: 'Qué productos encajan',
    intro: 'Antes de sugerir preguntas, el copiloto identifica qué soluciones del catálogo responden a lo que dice el cliente.',
    pasos: [
      { t: 'Lectura de la conversación', d: 'La IA interpreta el lenguaje natural y lo compara con la señal del cliente de cada producto.' },
      { t: 'Respaldo por palabras clave', d: 'Si la IA tarda más de 8 s o falla, se busca por coincidencias en el catálogo.' },
      { t: 'Validación de SKU', d: 'Cualquier producto que no exista en el catálogo se descarta y se cuenta como bloqueado.' },
      { t: 'Tu control', d: 'Lo que descartas no vuelve a aparecer; lo que agregas manualmente se respeta.' }
    ] },
  { icon: Radio, eyebrow: 'Paso 2 · Reunión en vivo', titulo: 'Cómo se eligen las preguntas',
    intro: 'Cada producto detectado trae sus propias preguntas clave, definidas por el equipo de preventa.',
    pasos: [
      { t: 'Origen en el catálogo', d: 'Se toman las preguntas clave de cada producto candidato, con su SKU como fuente.' },
      { t: 'Orden por relevancia', d: 'Primero las del producto más relacionado con la necesidad del cliente.' },
      { t: 'Sin duplicados', d: 'Si dos productos comparten una pregunta, aparece una sola vez.' },
      { t: 'Filtro de avance', d: 'Se ocultan las marcadas como hechas o "no aplica"; se muestran máximo 3.' }
    ] },
  { icon: Video, eyebrow: 'Paso 3 · Videollamada', titulo: 'La guía lateral',
    intro: 'Durante la llamada, la guía combina el contexto previo del cliente con lo detectado en vivo.',
    pasos: [
      { t: 'Correo primero', d: 'Si la llamada viene de un correo, sus preguntas clave van al inicio.' },
      { t: 'Luego el catálogo', d: 'Se suman las preguntas de los productos detectados, sin repetir.' },
      { t: 'Arranque genérico', d: 'Sin contexto: problema, sedes y empleados, servicios actuales, fecha o presupuesto.' },
      { t: 'Match perfecto', d: 'Al completar todas las clave, se celebra y puedes pasar directo a cotizar.' }
    ] },
  { icon: MessageCircleQuestion, eyebrow: 'Paso 4 · Preguntas del cliente', titulo: 'Respuestas seguras',
    intro: 'Cuando el cliente pregunta algo directo, el copiloto propone una respuesta con fuente.',
    pasos: [
      { t: 'Respaldo obligatorio', d: 'La respuesta debe citar un SKU real; si no, se bloquea.' },
      { t: 'Fuera de catálogo', d: 'Se responde: "No está en el catálogo; lo confirmo con un arquitecto."' },
      { t: 'Descuentos', d: 'Si piden más de 10%, se muestra un aviso fijo de autorización.' },
      { t: 'Contador visible', d: '"Inventadas bloqueadas" muestra cuántas respuestas se frenaron.' }
    ] },
  { icon: ShieldCheck, eyebrow: 'Paso 5 · Reglas', titulo: 'Cuándo entra un arquitecto',
    intro: 'Las 10 reglas de escalamiento y el cotizador se calculan en código, nunca por la IA.',
    pasos: [
      { t: 'Reglas deterministas', d: 'Mismos datos, mismo resultado, siempre.' },
      { t: 'Productos a la medida', d: 'Disparan revisión técnica automáticamente.' },
      { t: 'Paquetes', d: 'Se sugieren solo si todos sus productos están presentes.' },
      { t: 'Precios verificados', d: 'Cada SKU y precio se valida contra el catálogo antes del PDF.' }
    ] }
];