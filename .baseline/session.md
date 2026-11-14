# Sesión — auth-frontend-angular

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

MVP completo y verificado. Última tarea: separar el proxy BFF en `auth-proxy.ts` + `api-proxy.ts` y corregir el host validation (fail-closed).

## Último avance comprobado

- **Proxy BFF separado**: `auth-proxy.ts` (auth: login, register, google, refresh, logout, me, con cookies HttpOnly) + `api-proxy.ts` (CRUD genérico: forwarding, refresh-on-401, 502, CSRF, json-error). `server.ts` monta `authProxy` en `/auth` antes del catch-all `apiProxy`.
- **Host validation seguro**: `allowed-hosts.ts` lee `NG_ALLOWED_HOSTS` de env; fail-closed (sin fallback inseguro). `server.ts` usa `getAllowedHosts()`.
- **Config override**: `env.ts` carga `.env` siempre y sobrescribe variables del sistema (fix de "API Key inválida").
- **Handler refactorizado**: lógica de CSP (nonce) extraída a middleware + helper `sendHtmlWithNonce`. Handler queda en ~12 líneas (scaffold + llamada condicional).
- **Docstrings corregidos**: `auth-guard.ts` (async contra `/auth/me`) y `app.routes.server.ts` (cookies HttpOnly, no localStorage).
- **Verificado**: `ng build` OK (8.6s), `ng test` **27/27**.

## Pendientes

- GitHub / Apple (stubs en botones; falta `auth-<provider>-service.ts`).
- `/auth/connect` + `/auth/unlink` (unificar cuentas).
- Verificación de email real.
- MFA/2FA (código TOTP en frontend).
- Cambio de correo/contraseña y flujo "olvidé contraseña".
- Lint (eslint + @angular-eslint) y script `pnpm lint`.
- Limpiar `ApiService` (métodos muertos) y `message-error-component` (`text-white`).
- Tests E2E del flujo completo.
- Allowlist de rutas en el proxy genérico (cuando haya CRUD).

## Nota

`allowedHosts` en `angular.json` sigue en `[]` (dev server). En producción, `server.ts` lee `NG_ALLOWED_HOSTS` de env (fail-closed). Para dev local, setear `NG_ALLOWED_HOSTS=localhost,127.0.0.1` en `.env`.
