# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Refactor del BFF (`/server`): separación de responsabilidades sin cambiar contratos HTTP.

## Último avance comprobado

- **`api-proxy.ts`** delgado (CSRF → fetch → tokens → respuesta); lógica extraída a módulos nuevos:
  - `http/cookies.ts` (parseo + `cookieOpts` + builder)
  - `http/proxy-headers.ts` (SKIP_HEADERS + `forwardHeaders`)
  - `middleware/csrf.ts` (doble envío, 403 JSON)
  - `services/session.service.ts` (emit/clear cookies, `refreshSession` con catch → sesión inválida)
- **Upstream down → 502 JSON** `upstream-unavailable` (antes: error handler de Express).
- Constantes de TTL centralizadas (`ACCESS_TOKEN_TTL_SEC=900`, `REFRESH_TOKEN_TTL_SEC=86400`).
- Eliminada doble fijación del `Content-Security-Policy` en `server.ts` (Angular no emite CSP propio; cabecera HTTP prevalece).
- Comentarios con nombres completos según convención (Cross-Site Request Forgery, Content Security Policy).
- **Verificado**: `ng build` OK, `ng test` **9/9**.

## Archivos tocados

- `src/server.ts`, `src/server/proxy/api-proxy.ts`
- Nuevos: `src/server/http/cookies.ts`, `src/server/http/proxy-headers.ts`, `src/server/middleware/csrf.ts`, `src/server/services/session.service.ts`

## Pendientes

- Confirmar commit/push por el usuario.
- Actualizar `DEVELOPMENT.md` (estructura `/server`) solo con autorización.

## Siguiente paso

- MVP sigue en estado verificado; siguiente según prioridad del usuario (GitHub/Apple, `/auth/connect`, MFA, verificación de email).
