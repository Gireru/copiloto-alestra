# AGENTS.md

## Contexto del proyecto

Repositorio de **Alestra Copilot**, el copiloto comercial en vivo de Alestra. Mantén los cambios enfocados en lo que se pide y respeta las convenciones existentes del proyecto.

Empieza por `README.md` para entender la plataforma y el flujo de desarrollo local.

## Archivos clave

- `src/`: código fuente del frontend.
- `src/api/`: cliente de API del frontend.
- `vite.config.js`: configuración de Vite.
- `.env.local`: valores locales; nunca subas secretos al repositorio.

## Notas de trabajo

- Reutiliza el cliente de API y los patrones existentes antes de agregar nuevas integraciones.
- Ejecuta las verificaciones de `package.json` (`npm run lint`, `npm run build`) antes de terminar un cambio.
