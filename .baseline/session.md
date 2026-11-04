# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Refresh token (rotación + idle) en el frontend. Implementado; falta prueba funcional.

## Último avance comprobado

- `AuthStoreService`: guarda access+refresh (`setSession(access, refresh)`, `clearSession`, `readRefreshToken`, `updateAccessToken`, `hasSession`). Signals internos.
- `auth-interceptor.ts` (nuevo, registrado ANTES de `errorInterceptor`): añade `Authorization: Bearer` a la API propia; ante **401** llama `/auth/refresh`, reintenta la request original; si el refresh falla → `clearSession()` + navega a `/` (logout automático).
- `home-page`: delega el Bearer al interceptor (conserva guarda de presencia para no disparar 401 sin sesión).
- `models.ts`: `ApiAuthGoogleResponse.refresh_token`; `auth-page` pasa refresh al `setSession`.
- Login + `/auth/me` + user-details (provider/name/apellido/avatar con `referrerpolicy`) funcionando e2e (usuario). Backend refresh ya commiteado.
- `pnpm ng build` OK (2026-11-04). `pnpm lint` no existe.

## Archivos tocados (esta ronda)

- `core/services/auth-store-service.ts`, `core/interceptors/auth-interceptor.ts` (nuevo), `app.config.ts`, `features/auth/pages/auth-page/auth-page.ts`, `features/auth/models/models.ts`, `features/home/pages/home-page/home-page.ts`

## Pendientes

- Prueba funcional del refresh en navegador (expirar access token / forzar 401).
- `authGuard` en `/home` (hoy abierta; el 401→logout mitiga pero no bloquea la ruta).
- `.env.demo` DEBUG/API_KEY sin consumidor; `ValidationException.super__` typo (backend); `verify_api_key_header` (2º round); tests (0 en ambos).
- Logout: el `clearSession()` local ya limpia ambos tokens; falta llamar `POST /auth/logout` (revoca sesiones server-side).
