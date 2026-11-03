# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activo

AUTH frontend (Google) — arquitectura corregida. El login falla; el usuario depura con error real visible ahora.

## Último avance comprobado

- Arquitectura: la página orquesta (Google→API→store→navegar); `AuthStore` = estado puro (`token` + `isAuthenticated`, `setSession()`, `clear()`), sin Router/HTTP. `describeError()` traduce `HttpErrorResponse` (incluye `detail` de FastAPI) a toast legible; `LoggerService` (dev-only) loguea el error crudo.
- Commit f8e5e06 hecho por el usuario; luego se agregó `provideHttpClient()` en `app.config.ts` y `baseUrl` sin doble slash (arreglado tras error de login).
- Modelos `AuthUser`/`Role` restaurados por pedido del usuario (contrato backend, fase 2).
- Verificación: `pnpm ng build` OK (2026-11-03). Sin tests (vitest no configurado). Funcional no probado.

## Archivos tocados

- `features/auth/services/auth-store.ts`, `pages/auth-page/*`, `models/models.ts`, `app.config.ts`, `core/services/api-service.ts`, DEVELOPMENT.md

## Pruebas ejecutadas y resultado real

- `pnpm ng build` → bundle completo OK. Sin prueba funcional del login (backend debe correr en 127.0.0.1:8000).

## Bloqueos

- Login sigue fallando en la prueba del usuario; con `describeError` verá la causa real (¿401 aud=GOOGLE_CLIENT_ID? ¿500 backend? ¿CORS?). El backend `routes.py` usa `CredentialsException` sin importarla (500 si llega token vacío).
- `home-page.ts` logout no limpia el JWT (fuera de auth). Pendiente.

## Siguiente paso

- Que el usuario re-pruebe el flujo y comparta el mensaje del toast / detalle de Network para diagnosticar la causa real.
