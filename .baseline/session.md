# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Auth frontend: Google + register + login clásico (local) e2e. Core refactorizado.

## Último avance comprobado

- **Google e2e**: login, `/auth/me`, user-details (nombre/apellido/rol/provider/avatar), renovación silenciosa, idle 30 min/absoluto 1 día, guard `/home`, logout server-side, 404.
- **Register**: `RegisterPage` → `AuthService.register` → `setSession` → `/home` (auto-login). Componente con validaciones (email, password 8-128, confirm) → `errorMessage`.
- **Login clásico**: `auth-login-component` (form real + validaciones) → `AuthPage.loginAuth` → `AuthService.login` → `/home`.
- **Fix 401**: login/register (sin Bearer) NO disparan refresh ni logout; `error-interceptor` muestra el 401 solo sin Bearer. `auth-interceptor`: criterio "llevaba Bearer" (sin lista de URLs); refresh vía `AuthService.refresh` (HttpContext SKIP).
- **Refactor**: URL base en `environment.apiUrl`; `home-page` usa `rxResource` + `AuthService.me()` (no arma URL); modelos (`ApiAuth*`, `*Form`) y `isLoading`/`submitted` unificados; eliminados `AuthUser`/`Role` muertos.
- Tests: **20/20** (`ng test`). `ng build` OK. `pnpm lint` no existe.

## Pendientes

- GitHub / Apple (stubs). `/auth/connect` (unificar cuentas). Verificación de email.
- Limpiar `ApiService` (métodos muertos) y `message-error-component` (text-white).
- `docs/auth-flow.md` §9 tiene el roadmap completo.

## Nota

Prueba funcional pendiente del usuario: register/login local en navegador (los 5 pasos del flujo).
