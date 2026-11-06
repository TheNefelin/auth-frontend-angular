# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Fase 1 del BFF: proxy `/ssr-api` conectado. Fase 2 (cookies HttpOnly) pendiente.

## Último avance comprobado

- **BFF (Paso 2)**: `server.ts` monta `express.json()` + `/ssr-api` → `apiProxy`.
  - `src/server/config.ts`: carga `.env` con `process.loadEnvFile` (el entorno real manda); exige `API_URL`/`API_KEY`.
  - `src/server/proxy/api-proxy.ts`: añade `X-API-Key`, quita el prefijo, filtra hop-by-hop, repone `Set-Cookie`, 502 RFC 9457.
  - `environment.apiUrl = '/ssr-api'`; `auth-interceptor` usa ese prefijo; su spec toma la URL del environment.
  - El CSP vive solo en el `<meta>` de `index.html` (el middleware de Express era código muerto: se eliminó).
- **Verificado**: `ng build` OK; `ng test` **20/20**; en `ng serve` y en el build SSR: `/ssr-api/health` 200, `/ssr-api/auth/me` 401, `/ssr-api/auth/login` 401 (body reenviado); navegador sin errores de consola. `API_KEY` no aparece en el bundle del cliente.
- Flujo auth sin cambios funcionales: los tokens siguen en `localStorage` hasta Fase 2.

## Pendientes

- **Fase 2**: cookies `HttpOnly`, sesión en el BFF, retirar `auth-interceptor`, CSRF.
- **Backend**: conectar `verify_api_key` (`secrets.compare_digest`) en routers de datos (no login/register/google/health).
- GitHub / Apple (stubs), `/auth/connect`, verificación de email.
- `docs/auth-flow.md` §9 tiene el roadmap completo.

## Nota

Prueba funcional pendiente del usuario: login Google y login local por `/ssr-api` en navegador.
