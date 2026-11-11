# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Refactor del BFF (`/server`): separación de responsabilidades sin cambiar contratos HTTP.

## Último avance comprobado

- **Refactor del BFF** (sesión actual): `api-proxy.ts` delgado; módulos `http/cookies.ts`, `http/proxy-headers.ts`, `middleware/csrf.ts`, `middleware/json-error.ts`, `services/session.service.ts`.
- **Endurecimiento 1–3**: `expires_in` saneado (`ttl()` finito/positivo), body JSON inválido → 400 JSON (`malformed-json`), `refreshSession` con `AbortSignal.timeout(5000)`.
- Upstream inalcanzable → 502 JSON; sin doble Content-Security-Policy en `server.ts`.
- **Verificado**: `ng build` OK, `ng test` **27/27**.

## Archivos tocados

- `src/server.ts`, `src/server/proxy/api-proxy.ts`
- Nuevos: `src/server/http/` (cookies, proxy-headers), `src/server/middleware/` (csrf, json-error), `src/server/services/` (session)
- Specs BFF: `http/cookies.spec.ts`, `middleware/csrf.spec.ts`, `middleware/json-error.spec.ts`, `services/session.service.spec.ts`

## Pendientes

- Confirmar commit/push por el usuario.
- Actualizar `DEVELOPMENT.md` (estructura `/server`) solo con autorización.

## Siguiente paso

- MVP sigue en estado verificado; siguiente según prioridad del usuario (GitHub/Apple, `/auth/connect`, MFA, verificación de email).
