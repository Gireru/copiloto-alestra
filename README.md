# Alestra Copilot

**Una nueva forma de vender.** Alestra Copilot es un copiloto comercial que acompaña al vendedor en vivo durante cada llamada: escucha al cliente, guía el levantamiento, clasifica el requerimiento y genera la cotización en PDF antes de colgar.

> *"Quien ahorra el tiempo del cliente, gana su lealtad."*
> De 3 semanas a minutos. Respuestas inmediatas, cierres inmediatos.

---

## El problema

Hoy, el cliente explica lo mismo una y otra vez y espera semanas para recibir una propuesta. Muchas veces ni siquiera sabe con precisión qué necesita, lo que vuelve el proceso lento, ciego y desgastante.

| Situación actual | |
|---|---|
| **3 sesiones** | hasta tener el requerimiento completo |
| **3 semanas** | como máximo para enviar la propuesta económica |
| **Casi siempre** | entra un arquitecto al levantamiento inicial |

### Diagnóstico: el conocimiento existe, pero no llega a la llamada

- **No sabe qué preguntar:** el levantamiento queda incompleto y se convoca a otra junta técnica.
- **Falta de certeza en vivo:** no se puede dar una recomendación contundente ni cotizar en tiempo real.
- **Llama al arquitecto:** el cliente tiene que repetir su historia desde cero.

Alestra Copilot resuelve esto poniendo todo el catálogo y el criterio técnico en la pantalla del vendedor.

---

## Cómo funciona: de la voz a la cotización

| Paso | Qué hace |
|---|---|
| **01 · Escucha en vivo** | Transcribe al cliente en tiempo real y detecta requerimientos o incidentes críticos al instante. |
| **02 · Guía preguntas** | Sugiere qué preguntar para completar el levantamiento técnico sin omitir datos esenciales. |
| **03 · Clasifica** | Identifica si el caso es estándar, mixto o a la medida, siguiendo reglas de negocio definidas en código. |
| **04 · Cotiza en PDF** | Genera una propuesta formal con precios validados del catálogo antes de terminar la llamada. |

### Funcionalidades de la aplicación

- Reunión en vivo con grabación y transcripción de audio.
- Videollamada con panel del copiloto: preguntas clave y productos recomendados.
- Animación de "match perfecto" al completar el levantamiento.
- Bandeja de correos de clientes con acceso directo a videollamada.
- Subida de audio con transcripción y generación de cotización en PDF.
- Motor de propuestas comerciales y análisis de conversación.
- Visualizador IA del flujo de datos.

---

## Despliegue inmediato

Alestra podría usarlo con su equipo mañana, con cero fricción:

- **Usa lo que ya existe:** catálogo, paquetes, tarifas y reglas de escalamiento actuales, sin sustituir infraestructura.
- **Se alimenta continuamente:** fácil de actualizar con nuevos servicios o políticas comerciales sin reentrenar modelos.
- **Ya lo saben vender:** es un agente de conocimiento interno idéntico al que Alestra ofrece a sus propios clientes.

**Piloto propuesto:** 2 semanas con un equipo comercial en Centro Sperto, midiendo velocidad de cierre y precisión.

---

## Impacto

| Indicador operativo | Antes (hoy) | Con Alestra Copilot | Impacto |
|---|---|---|---|
| Sesiones de levantamiento | 3 reuniones | 1 sola reunión | Cero juntas redundantes para el cliente |
| Tiempo hasta la propuesta | Hasta 3 semanas | Segundos / minutos | Cotización en la misma llamada |
| Participación de arquitectos | Casi siempre | Solo en casos a la medida | Ingeniería enfocada en proyectos de alto valor |

- **100 %** precios validados
- **0** SKUs inventados
- **−95 %** tiempo de respuesta

---

## Tecnología

- React 18 + Vite
- Tailwind CSS y componentes Radix UI
- TanStack Query, React Router
- Framer Motion y canvas-confetti para animaciones
- jsPDF y html2canvas para la generación de cotizaciones

## Desarrollo local

```bash
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run lint    # revisión de código
```

## Estructura

- `src/` — código fuente del frontend (páginas, componentes y cliente de API).
- `public/brand/` — logotipos e íconos de la marca.
