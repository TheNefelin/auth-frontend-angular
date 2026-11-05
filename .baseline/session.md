# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Auth Google e2e cerrado (login → sesión → perfil → renovación → expiración → logout). Suite de tests en verde.

## Último avance comprobado

- **Google Auth e2e completo y probado por el usuario**: login, `/auth/me`, user-details (nombre/apellido/rol/provider/avatar), renovación silenciosa (401→refresh→retry), idle 30 min / absoluto 1 día (expulsa), guard en `/home`, logout server-side, not-found 404.
- **Fix del toast falso de 401**: `app.config` ordena `[errorInterceptor, authInterceptor]` (el auth va por dentro) y `error-interceptor` no muestra toast en 401.
- `AuthStoreService` guarda access+refresh (signals). `auth-interceptor` añade Bearer, refresca en 401, reintenta; si falla → logout+redirect.
- `/home` en `RenderMode.Client` (SSR no ve localStorage).
- Tests: **18/18** (`ng test`). `ng build` OK. `pnpm lint` no existe.

## Pendientes

- `forbidden`/guard de rol: DESCARTADO (sin disparador real; nace con una pantalla que requiera roles).
- Detección de reuso del refresh (endurecimiento).
- GitHub / Apple / login clásico (replicar patrón Google).
- Tests de integración con backend; `pnpm lint`.
- Evaluar cookie `HttpOnly` (BFF) frente a localStorage (riesgo XSS).
- `docs/auth-flow.md` §9 tiene el roadmap completo.
