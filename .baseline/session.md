# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activo

AUTH frontend (Google) — login funcionando extremo a extremo (verificado por el usuario 2026-11-03).

## Último avance comprobado

- `AuthStoreService` (`core/services/auth-store-service.ts`): `setSession/clearSession/readStoredToken()` público. Migración completa y verificada (página usa el core, servicio viejo borrado, `ng build` OK).
- Lint/spec: `pnpm lint` no existe en package.json.
- Login funciona e2e (usuario). Bug pendiente mañana: desactivar globalmente TODOS los botones al hacer click en cualquiera (solución propuesta: 1 interruptor `disabled()` compartido + `loginGoogle` que también lo levanta/baja).
- Pendientes: `auth-store-service.ts` sin `USER_KEY` legacy (decisión del usuario), `readStoredToken` público ocioso hasta el interceptor, Tier 1 (interceptor Bearer, authGuard, logout de home), home-page no limpia JWT.

## Archivos tocados

- `src/app/core/services/auth-store-service.ts` (nuevo), `features/auth/services/auth-store.ts` (eliminado), `features/auth/pages/auth-page.ts`, `.baseline/session.md`

## Archivos tocados

- `features/auth/services/auth-store.ts`, `pages/auth-page/*`, `models/models.ts`, `app.config.ts`, `core/services/api-service.ts`, DEVELOPMENT.md

## Pruebas ejecutadas y resultado real

- `pnpm ng build` → bundle completo OK. Sin prueba funcional del login (backend debe correr en 127.0.0.1:8000).

## Bloqueos

- Login falló en prueba real: backend devolvía 500 (`AuthService` roto por indentación) sin cabeceras CORS → `status 0` en el navegador. Backend arreglado y verificado por import: `service.py` (indentación + datetime) y `routes.py` (import CredentialsException, imports duplicados). `describeError()` ya muestra el detalle real.
- `home-page.ts` logout no limpia el JWT (fuera de auth). Pendiente.

## Siguiente paso

- Que el usuario re-pruebe el flujo y comparta el mensaje del toast / detalle de Network para diagnosticar la causa real.
