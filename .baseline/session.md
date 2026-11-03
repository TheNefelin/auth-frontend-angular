# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activo

AUTH frontend (Google) — login funcionando extremo a extremo (verificado por el usuario 2026-11-03).

## Último avance comprobado

- `AuthStoreService` (`core/services/auth-store-service.ts`): estado mínimo — `setSession(token)`, `clearSession()`, `readStoredToken()` público (para el futuro interceptor). Sin signals (nada reactivo aún). Migración completa y verificada: la página inyecta el core; el servicio viejo de la feature fue eliminado; `pnpm ng build` OK (2026-11-03).
- Nota: el borrado de la clave legacy `user` quedó fuera de `clearSession` (decisión del usuario: el flujo actual ya no la escribe). Login funciona extremo a extremo (verificado por el usuario).

## Archivos tocados

- `features/auth/services/auth-store.ts`, `pages/auth-page/*`, `models/models.ts`, `app.config.ts`, `core/services/api-service.ts`, DEVELOPMENT.md

## Pruebas ejecutadas y resultado real

- `pnpm ng build` → bundle completo OK. Sin prueba funcional del login (backend debe correr en 127.0.0.1:8000).

## Bloqueos

- Login falló en prueba real: backend devolvía 500 (`AuthService` roto por indentación) sin cabeceras CORS → `status 0` en el navegador. Backend arreglado y verificado por import: `service.py` (indentación + datetime) y `routes.py` (import CredentialsException, imports duplicados). `describeError()` ya muestra el detalle real.
- `home-page.ts` logout no limpia el JWT (fuera de auth). Pendiente.

## Siguiente paso

- Que el usuario re-pruebe el flujo y comparta el mensaje del toast / detalle de Network para diagnosticar la causa real.
