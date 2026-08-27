# Webmail frontend

React + TypeScript + Tailwind v4. Layout de 3 paneles estilo Gmail
(sidebar / lista de mensajes / lectura), con acento teal, Inter para texto
general y JetBrains Mono para metadata (fechas, direcciones de email).

## Desarrollo local

```bash
npm install
npm run dev
```

El dev server (Vite) proxea `/api` hacia `http://localhost:8000` (ver
`vite.config.ts`), así que hace falta tener el backend corriendo en ese
puerto — ver `../mailserver-backend/README.md`.

## Build de producción

```bash
npm run build
```

Genera `dist/`, que el backend sirve como estáticos en el contenedor único
(ver `../mailserver-backend/Dockerfile`). Este repo no necesita su propio
Dockerfile: el build de producción se orquesta desde `mailserver-backend`.
