# AGENTS.md — Reglas operativas para agentes (IA o humanos) que trabajen en este repo

## Gestor de paquetes: SOLO pnpm

Este proyecto está versionado con **pnpm**. El uso de `npm` o `yarn` está
**prohibido bajo cualquier circunstancia**.

La regla se aplica en tres capas y se rompe si:

1. **`package.json`** declara `"packageManager": "pnpm@9.15.4"`. Corepack
   bloquea `yarn` automáticamente.
2. **`scripts/preinstall`** ejecuta `scripts/only-allow-pnpm.mjs`, que
   detecta `npm_execpath` y aborta con código 1 si la instalación no
   proviene de pnpm.
3. **`.npmrc`** configura el comportamiento de pnpm.

Si necesitas añadir una dependencia:

```bash
pnpm add <paquete>          # runtime
pnpm add -D <paquete>       # dev
```

**Nunca** `npm install`, `npm i`, `yarn add`, `yarn install`.

## Comandos esenciales

| Tarea | Comando |
|---|---|
| Instalar dependencias | `pnpm install` |
| Servidor de desarrollo | `pnpm run dev` (http://localhost:5173) |
| Build de producción | `pnpm run build` → `./dist/` |
| Typecheck | `pnpm run typecheck` |
| Lint | `pnpm run lint` |

El backend Spring Boot (`ZoneControl-Backend`) debe estar corriendo en
`http://localhost:8080` para que el proxy de `/api` funcione en desarrollo.

## Sincronización con el backend

Este repo NO sirve producción por sí solo. El bundle generado con
`pnpm run build` debe copiarse a `ZoneControl-Backend/src/main/resources/static/`
siguiendo el flujo documentado en su README.

## Estructura

- `src/` — código de la SPA (componentes, hooks, rutas, stores, vistas).
- `public/` — assets estáticos servidos tal cual (imágenes SVG/JPG).
- `scripts/only-allow-pnpm.mjs` — guard de preinstalación.
- `vite.config.ts` — `outDir: "dist"`; proxy `/api` → `http://localhost:8080`.