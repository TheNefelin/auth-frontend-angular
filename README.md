# auth-frontend-angular — Sistema de Autenticación (Angular)

Frontend Angular 22+ (signal-based) para autenticación transversal.
Se conecta con el backend FastAPI vía BFF (proxy `/ssr-api` en Express).

## Stack

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Angular 22 (signal-based) | En uso |
| Estilos | Tailwind CSS + DaisyUI | En uso |
| Estado | Signals (no `subscribe` manual en componentes) | En uso |
| HTTP | `HttpClient` + interceptores funcionales | En uso |
| Tests | vitest (`ng test`) | 27/27 |
| Build | `ng build` | OK |

## Instalación

```bash
# 1. Clonar repositorio y entrar al proyecto
cd auth-frontend-angular

# 2. Instalar Node.js (v22+) y pnpm
#    Verifica con: node -v && pnpm -v

# 3. Instalar paquetes del frontend (con pnpm)
```

### 3.1 Estilos (Tailwind CSS + DaisyUI)
```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
pnpm add -D daisyui
```

### 3.2 Utilidades (solo si no vienen con Angular)
```bash
pnpm add prettier
```

> **Nota:** Angular SSR (`@angular/ssr`) ya incluye `express` automáticamente
> al crear el proyecto con `ng new --ssr`. No es necesario instalarlo a mano.
> Los paquetes `@angular/*`, `rxjs`, `tslib`, `@types/*`, `vitest` y `jsdom`
> también vienen por defecto con Angular CLI 22+.

```bash
# 4. Configurar variables de entorno del servidor (BFF)
cp .env.demo .env
# Editar .env con tus valores (API_URL, API_KEY, GOOGLE_CLIENT_ID)
# .env está fuera de git; .env.demo es la plantilla versionada

# 5. Ejecutar el servidor de desarrollo
pnpm ng serve
# Abre http://localhost:4200/
```

> **Regla**: `install`, `build` y `test` se ejecutan **dentro de `auth-frontend-angular/`**, nunca en la raíz del workspace.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

Para producción (con CSP restrictivo y nonces):
```bash
# 1. Build
pnpm ng build

# 2. Ejecutar el servidor SSR (lee .env del frontend)
PRODUCTION=true node dist/frontend-python/server/server.mjs
```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

Suite actual: **27/27** tests.

## Arquitectura BFF (seguridad)

El frontend **nunca** conoce la URL real de la API ni la API Key:

```
Navegador → /ssr-api/* (mismo origen) → Express BFF → FastAPI (X-API-Key)
```

- **Tokens**: cookies `HttpOnly` (no accesibles por JavaScript).
- **CSRF**: doble envío (`csrf_token` cookie + `X-CSRF-Token` header).
- **CSP**: permisivo en dev (`<meta>`), restrictivo en prod (cabecera HTTP con nonces).
- **Errores**: upstream inalcanzable → 502 JSON; body inválido → 400 JSON (nunca HTML de errores).
- El BFF está modularizado en `http/` (cabeceras y cookies), `middleware/` (CSP, CSRF, JSON) y `services/` (sesión/refresh).

## Seguridad
- Las credenciales del servidor (`.env`) nunca se commitean (`.env` está en `.gitignore`).
- Los tokens de sesión viven en cookies `HttpOnly` (no en `localStorage`).
- La API Key (`API_KEY`) debe coincidir con la del backend.

## Pendientes
- GitHub / Apple (stubs).
- `/auth/connect` (unificar cuentas).
- Verificación de email real.
- MFA/2FA.
- Endurecer `style-src` en el CSP (riesgo bajo, aceptado por la industria).