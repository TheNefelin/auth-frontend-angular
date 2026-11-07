# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Fase 2 del BFF: sesión en cookies HttpOnly completada. Tokens fuera del navegador.

## Último avance comprobado

- **Fase 2 (HttpOnly + CSRF)**: `api-proxy.ts` guarda tokens en cookies `HttpOnly; SameSite=Lax`
  y emite `csrf_token` (legible) para doble envío; verifica `X-CSRF-Token` en
  peticiones mutantes; refresca en el servidor ante un 401; logout borra todo.
- `csrfInterceptor` lee la cookie y envía `X-CSRF-Token` en mutaciones.
- `AuthStoreService` ya no toca `localStorage` (solo flag `hasSession`).
- `AuthService` devuelve `void`; `auth-interceptor` + `auth-context` eliminados.
- `authGuard` asíncrono (pregunta `/auth/me`); `error-interceptor` gestiona la
  sesión muerta (401 con sesión activa → limpiar + redirect).
- Verificado en navegador: register → `/home` sin tokens en `localStorage`, cookies
  no visibles a JS, refresh persiste tras recargar, 0 errores de consola.
- Verificado por curl: refresh-on-401 del BFF (200 con cookie nueva), logout
  borra cookies, 401 después.
- `ng build` OK, `ng test` **9/9** (guard async), `pytest` **50/50**.

## Pendientes

- Endurecer CSP para producción (hashes/nonces, quitar unsafe-inline/eval).
- CSRF de doble envío (hoy solo SameSite=Lax).
- GitHub / Apple (stubs), `/auth/connect`, verificación de email.
- `docs/auth-flow.md` §9 tiene el roadmap completo.

## Nota

Prueba funcional pendiente del usuario: login Google y local por `/ssr-api`.
