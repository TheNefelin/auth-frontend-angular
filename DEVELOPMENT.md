# DEVELOPMENT.md — Mapa del proyecto frontend-python (Angular 21+)

Este archivo es la memoria viva del frontend. Se actualiza solo con decisiones que sobreviven a la sesión. No es un diario.

---

## 1. Propósito

Frontend de autenticación transversal con Angular 21+ (signal-based), CSR/SSR.
Se conecta con el backend FastAPI para login, Google, GitHub, Apple, refresh y logout.

---

## 2. Stack

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Angular 22 (signal-based) | Existente |
| Styling | Tailwind CSS + DaisyUI | En uso |
| Estado | Signals (no `subscribe` manual en componentes) | En uso |
| HTTP | `httpResource` / `HttpClient` + interceptores funcionales | En uso |
| Tests | vitest (`ng test`) | 20/20 |
| Build | `ng build` | OK |

---

## 3. Estructura de carpetas (existente)

```
frontend-python/
├── DEVELOPMENT.md          ← este archivo
├── AGENTS.md               ← reglas de operación
├── SKILL.md                ← reglas del stack Angular
├── .baseline/              → baseline propio
│   ├── AGENTS.md
│   ├── session.md
│   └── skills/angular
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
│   │   ├── core/           → servicios base, interceptores, guards
│   │   └── features/       → features por dominio (auth, users, etc.)
│   ├── server.ts            → Express SSR: monta /ssr-api y renderiza Angular
│   ├── server/              → BFF (solo servidor): config.ts, proxy/, middleware/
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
| `auth-interceptor`: criterio "llevaba Bearer" (sin lista de URLs); refresh vía `AuthService.refresh` (HttpContext SKIP) | Interceptor delgado, sin rutas de negocio ni ciclos | Aceptado |
| `error-interceptor`: silencia 401 solo en peticiones autenticadas | Un 401 de login (sin Bearer) sí se muestra | Aceptado |
| `authGuard` de sesión (presencia, sin red) en `/home` | Ruta privada; el rol se resolverá en guard async aparte | Aceptado |
| `/home` en `RenderMode.Client` (SSR no ve localStorage) | Evita redirección falsa en prerender | Aceptado |

---

## 5. Pendientes

- [ ] GitHub / Apple (stubs).
- [ ] `/auth/connect` (unificar cuentas: mismo usuario con Google + local).
- [ ] Verificación de email.
- [ ] Tests de integración con backend (hoy solo unitarios).
- [ ] MFA/2FA en frontend (código TOTP).
- [ ] `pnpm lint` (no existe; solo `ng build` + tests).
- [ ] Limpiar `ApiService` (métodos muertos) y `message-error-component` (`text-white`).
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