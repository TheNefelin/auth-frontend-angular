# DEVELOPMENT.md — Mapa del proyecto auth-frontend-angular (Angular 22)

Este archivo es la memoria viva del frontend. Se actualiza solo con decisiones que sobreviven a la sesión. No es un diario.

---

## 1. Propósito

Frontend de autenticación transversal con Angular 22 (signal-based), CSR/SSR.
Se conecta con el backend FastAPI para login, Google, GitHub, Apple, refresh y logout.

---

## 2. Stack

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Angular 22 (signal-based) | En uso |
| Styling | Tailwind CSS + DaisyUI | En uso |
| Estado | Signals (no `subscribe` manual en componentes) | En uso |
| HTTP | `rxResource` / `HttpClient` + interceptores funcionales | En uso |
| BFF | Express 5 (SSR, cookies `HttpOnly`, CSRF, CSP) | En uso |
| Tests | vitest (`ng test`) | 27/27 |
| Build | `ng build` | OK |

---

## 3. Estructura de carpetas (existente)

```
auth-frontend-angular/
├── DEVELOPMENT.md          ← este archivo
├── AGENTS.md               ← reglas de operación
├── SKILL.md                ← reglas del stack Angular
├── .baseline/              → baseline propio
│   ├── AGENTS.md
│   ├── session.md
│   └── skills/angular, memoria
├── .env                    → secretos del servidor (fuera de Git)
├── .env.demo               → plantilla versionada
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── angular.json
├── src/
│   ├── app/
│   │   ├── app.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── core/           → servicios base, interceptores, guards, modelos
│   │   ├── features/       → features por dominio (auth, home, not-found)
│   │   └── shared/         → componentes compartidos y constantes de ruta
│   ├── server.ts            → Express SSR: monta /ssr-api y renderiza Angular
│   ├── server/              → BFF (solo servidor)
│   │   ├── http/            → cookies, cabeceras del proxy (proxy-headers)
│   │   ├── middleware/      → csp, csrf (doble envío), json-error
│   │   ├── services/        → session.service (cookies/refresh de sesión)
│   │   ├── proxy/api-proxy  → router delgado /ssr-api
│   │   └── env.ts / config.ts
│   ├── environments/        → environment.ts (apiUrl, googleClientId)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── public/
│   └── favicon.ico
└── README.md
```

> **Nota:** Este proyecto ya existe con código Angular. El agente **no modifica código sin autorización explícita del usuario**.

---

## 4. Decisiones de diseño (aceptadas)

| Decisión | Justificación | Estado |
|----------|---------------|--------|
| Estado con signals, sin `subscribe()` en componentes | Estado reactivo declarativo, sin fugas ni valores stale | Aceptado |
| `rxResource` para lecturas (llama a servicios) | `isLoading`/`error`/`value` gratis; la página no arma URLs | Aceptado |
| `OnPush` en componentes presentacionales | Menos detección de cambios, mejor rendimiento | Aceptado |
| Sin `NgModule`, sin `*ngIf`/`*ngFor` | Piso Angular 21+, control flow `@if`/`@for` | Aceptado |
| Página orquesta (llama al servicio + store + navega); componente presentacional emite | Servicios con una sola responsabilidad | Aceptado |
| `AuthService` solo HTTP; nunca navega ni toca el store | Datos ≠ UI; el flujo vive en página/interceptor | Aceptado |
| URL base del cliente: `environment.apiUrl = '/ssr-api'` (mismo origen) | Sin hardcode; el BFF oculta la URL real y la API Key | Aceptado |
| BFF: `src/server/config.ts` carga `.env` con `process.loadEnvFile` (el entorno real manda) | `ng serve` no pasa `--env-file`; cero dependencias | Aceptado |
| `auth-interceptor` retirado (Fase 2) | El BFF gestiona la sesión (cookies `HttpOnly`) y refresca ante un 401; el cliente no toca tokens | Aceptado |
| `csrf-interceptor` añade `X-CSRF-Token` en peticiones mutantes | El BFF compara cabecera vs cookie `csrf_token` (doble envío) | Aceptado |
| `error-interceptor`: silencia 401 solo en peticiones autenticadas | Un 401 de login (sin sesión) sí se muestra | Aceptado |
| `authGuard` asíncrono en `/home` | El cliente no puede leer la cookie `HttpOnly`: la guardia pregunta `/auth/me`. El rol se resolverá en guard async aparte | Aceptado |
| `/home` en `RenderMode.Client` (la sesión vive en cookies `HttpOnly` y el guard es async) | Evita redirección falsa en prerender | Aceptado |
| BFF modular: `http/`, `middleware/`, `services/`; router delgado; upstream caído → 502 JSON | Mantenibilidad, contratos uniformes, error nunca HTML | Aceptado |

---

## 5. Pendientes

- [ ] GitHub / Apple (stubs).
- [ ] `/auth/connect` (unificar cuentas: mismo usuario con Google + local).
- [ ] Verificación de email.
- [ ] Tests de integración con backend (hoy solo unitarios).
- [ ] MFA/2FA en frontend (código TOTP).
- [ ] `pnpm lint` (no existe; solo `ng build` + tests).
- [ ] Limpiar `ApiService` (métodos muertos: `getById`, `update`, `delete`) y `message-error-component` (`text-white`).
- [ ] El docstring de `auth-guard.ts` sigue describiendo la Fase 1 (presencia de sesión sin red, `authInterceptor`); el código ya es async contra `/auth/me`.
- [x] **Separar el proxy BFF en dos módulos** (implementado): `auth-proxy.ts` (auth) + `api-proxy.ts` (CRUD genérico). Ver `docs/auth-flow.md` §11.
- [ ] **Lint**: instalar `eslint` + `@angular-eslint` y añadir script `pnpm lint` (catálogo §8 lo exige; hoy solo `ng build` + tests).
- [ ] **Limpiar `ApiService`**: métodos muertos (`getById`, `update`, `delete`) y `message-error-component` (`text-white`).
- [ ] **Tests E2E del flujo completo**: register → login → refresh → logout (hoy solo unitarios).
- [ ] **`pnpm lint` en CI**: añadir al flujo de verificación.

### Listo para CRUD
- [x] Feature-based (`features/<dominio>/` con pages, components, services, models, routes).
- [x] Estado con signals, sin `subscribe()` en componentes.
- [x] `rxResource` para lecturas (`isLoading`/`error`/`value` gratis).
- [x] `OnPush` en componentes presentacionales.
- [x] Sin `NgModule`, sin `*ngIf`/`*ngFor` (control flow `@if`/`@for`).
- [x] Página orquesta (llama al servicio + store + navega); componente presentacional emite.
- [x] `AuthService` solo HTTP; nunca navega ni toca el store.
- [x] URL base del cliente: `environment.apiUrl = '/ssr-api'` (mismo origen).
- [x] BFF modular: `http/`, `middleware/`, `services/`, `proxy/`.
- [x] BFF: cookies `HttpOnly`, CSRF de doble envío, CSP con nonces.
- [x] `auth-proxy` y `api-proxy` separados (auth vs CRUD genérico).
- [x] `allowedHosts` seguro (fail-closed, lee `NG_ALLOWED_HOSTS`).
- [ ] **Nuevo feature CRUD**: crear `src/app/features/<dominio>/` con pages, components, services, models, routes. Reutilizar `ApiService` (o un servicio específico) y el `api-proxy` genérico. Sin `subscribe()` en componentes, `OnPush` en presentacionales.
- [x] **Separar el proxy BFF en dos módulos**: `auth-proxy.ts` (auth: login, register, google, refresh, logout, me, con gestión de cookies HttpOnly) y `api-proxy.ts` (CRUD genérico: forwarding con Bearer, refresh-on-401, 502, CSRF, json-error). Hoy `api-proxy.ts` (150 líneas) mezcla ambas concerns. Patrón de referencia: drakkar (separa por servicio) y portfolio (proxy inline). Ver plan en `docs/auth-flow.md` §11. **Implementado en esta sesión.**
- [ ] **Lint**: instalar `eslint` + `@angular-eslint` y añadir script `pnpm lint` (catálogo §8 lo exige; hoy solo `ng build` + tests).
- [ ] **Limpiar `ApiService`**: métodos muertos (`getById`, `update`, `delete`) y `message-error-component` (`text-white`).
- [ ] **Tests E2E del flujo completo**: register → login → refresh → logout (hoy solo unitarios).
- [ ] **`pnpm lint` en CI**: añadir al flujo de verificación.

### Listo para CRUD
- [x] Feature-based (`features/<dominio>/` con pages, components, services, models, routes).
- [x] Estado con signals, sin `subscribe()` en componentes.
- [x] `rxResource` para lecturas (`isLoading`/`error`/`value` gratis).
- [x] `OnPush` en componentes presentacionales.
- [x] Sin `NgModule`, sin `*ngIf`/`*ngFor` (control flow `@if`/`@for`).
- [x] Página orquesta (llama al servicio + store + navega); componente presentacional emite.
- [x] `AuthService` solo HTTP; nunca navega ni toca el store.
- [x] URL base del cliente: `environment.apiUrl = '/ssr-api'` (mismo origen).
- [x] BFF modular: `http/`, `middleware/`, `services/`, `proxy/`.
- [x] BFF: cookies `HttpOnly`, CSRF de doble envío, CSP con nonces.
- [x] `auth-proxy` y `api-proxy` separados (auth vs CRUD genérico).
- [x] `allowedHosts` seguro (fail-closed, lee `NG_ALLOWED_HOSTS`).
- [ ] **Nuevo feature CRUD**: crear `src/app/features/<dominio>/` con pages, components, services, models, routes. Reutilizar `ApiService` (o un servicio específico) y el `api-proxy` genérico. Sin `subscribe()` en componentes, `OnPush` en presentacionales.
- [x] Fase 2 del BFF: sesión en cookies `HttpOnly`; tokens fuera del navegador; `auth-interceptor` retirado; `SameSite=Lax` (CSRF de doble envío pendiente).
- [x] CSRF de doble envío: cookie legible `csrf_token` + cabecera `X-CSRF-Token` verificada por el BFF.

---

## 6. Reglas del proyecto (baseline)

- Idioma: español neutro, sin voseo.
- Seguridad primero: nunca guardar secretos ni tokens en código cliente.
- No sobreingeniería: solo lo necesario para el requisito actual.
- Evidencia: no afirmar comportamientos sin verificar.
- El usuario ejecuta git commit; el agente solo propone mensajes.

---

## 7. Notas

- Nada de secretos, tokens ni credenciales en código cliente: todo lo que llega al bundle es público.
- Antes de implementar, lee `.baseline/skills/angular/SKILL.md`.