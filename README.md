# ZoneControl — Frontend

SPA del sistema de **control de acceso físico** del laboratorio
[`zonecontrol.pdf`](../ZoneControl-Backend/docs/zonecontrol.pdf) (caso de
estudio). React 19 + Vite 8 + TypeScript 6, gestionado con **pnpm**.

> **Regla dura:** este proyecto usa **exclusivamente pnpm**. `npm` y `yarn`
> están bloqueados por Corepack (`packageManager` field) y por un guard de
> `preinstall` que detecta el gestor y aborta. Ver `AGENTS.md`.

## Requisitos

| Requisito | Versión | Notas |
|---|---|---|
| Node.js | 20.19+ / 22.12+ (probado en 24) | Lo exige Vite 8 |
| pnpm | 9.x | Habilitado vía Corepack |
| Backend | ZoneControl-Backend corriendo en `:8080` | Necesario para el proxy `/api` |

Activar pnpm (si aún no lo tienes):

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## Instalación y ejecución

```bash
pnpm install        # instalar dependencias
pnpm run dev        # dev server en http://localhost:5173 (proxy /api → :8080)
pnpm run build      # build de producción → ./dist/
pnpm run typecheck  # tsc -b
pnpm run lint       # oxlint src
```

## Estructura

```
ZoneControl-Frontend/
├── .gitignore
├── .npmrc
├── AGENTS.md                     ← reglas del proyecto (incluye "no npm")
├── README.md
├── index.html
├── package.json                  ← "packageManager": "pnpm@9.15.4"
├── pnpm-lock.yaml
├── tsconfig.json / .app / .node
├── vite.config.ts                ← outDir: "dist"
├── public/                       ← assets estáticos
├── scripts/
│   └── only-allow-pnpm.mjs       ← guard preinstall
└── src/
    ├── App.tsx, main.tsx
    ├── components/
    ├── hooks/
    ├── lib/
    ├── routes/
    ├── stores/
    ├── styles/
    ├── types/
    └── views/
```

## Despliegue

El backend Spring Boot (`ZoneControl-Backend`) sirve este frontend como SPA
estático desde `src/main/resources/static/`. Para actualizar el bundle:

```bash
# 1. Build aquí
pnpm run build

# 2. Copiar al backend (clonado adyacente)
rm -rf ../ZoneControl-Backend/src/main/resources/static/*
cp -r dist/* ../ZoneControl-Backend/src/main/resources/static/

# 3. Commit en el repo backend
cd ../ZoneControl-Backend
git add src/main/resources/static/
git commit -m "chore: sincronizar bundle SPA desde ZoneControl-Frontend"
```

> La automatización de este flujo vía CI/CD queda fuera del alcance de
> este README; ver el README del backend para más contexto.

## URLs

| Recurso | URL |
|---|---|
| Frontend dev | http://localhost:5173 |
| Backend API (proxy en dev) | http://localhost:8080 |
| App servida por Spring (tras sincronizar bundle) | http://localhost:8080 |