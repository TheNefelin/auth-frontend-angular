# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activo

AUTH frontend (Google) — optimización y limpieza. Hecho: conexión real página→store, DTO real, muertos eliminados.

## Último avance comprobado

- `AuthStore` (`auth-store.ts`, renombrado desde `auth-store.ts.ts`) cableado a la página; DTO `ApiAuthGoogleResponse` = `{ access_token, token_type, expires_in }`; `AuthUser`/`Role`/`currentUser` eliminados; JWT en localStorage; navegación única a HOME.
- `waitForScript()` con timeout de 10s; rechazos como `Error`.
- Muerto eliminado: `#googleBtn`, `ROUTES_CONSTANTS.AUTH`, doble `<use>` Apple, typos "wiith".
- Verificación: `pnpm ng build` OK (2026-11-03). `pnpm lint` no existe en package.json.

## Archivos tocados

- `features/auth/services/auth-store.ts` (nuevo), `auth-store.ts.ts` (eliminado), `auth-google-service.ts`, `models/models.ts`, `pages/auth-page/*`, componentes apple/github, `shared/constants/routes-constant.ts`, DEVELOPMENT.md

## Pruebas ejecutadas y resultado real

- `pnpm ng build` → bundle completo, 2 prerendered routes. Sin tests (vitest no configurado).

## Bloqueos

- `ApiService.baseUrl` hardcodeado con doble slash (`http://127.0.0.1:8000//auth/google`) → probable 404 en el POST real. Fuera del alcance auth; pendiente autorización de una línea en `core/services/api-service.ts`.
- `home-page.ts` logout no limpia `jwt_token` (fuera de auth). Pendiente.

## Siguiente paso

- Decisión del usuario: fix `ApiService` (core) y/o logout en home; fase 2: backend (`/auth/me`, `user`/role en respuesta).
