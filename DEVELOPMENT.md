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
| Tests | vitest (`ng test`) | 18/18 |
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
| `httpResource` para lecturas | `isLoading`/`error`/`value` gratis y cancelación automática | Aceptado |
| `OnPush` en componentes presentacionales | Menos detección de cambios, mejor rendimiento | Aceptado |
| Sin `NgModule`, sin `*ngIf`/`*ngFor` | Piso Angular 21+, control flow `@if`/`@for` | Aceptado |
| Login: página orquesta (Google→API→store→navegar); `AuthStoreService` guarda access+refresh | Servicios con una sola responsabilidad | Aceptado |
| `auth-interceptor` (Bearer + refresh en 401) **por dentro** de `error-interceptor` | El refresh resuelve el 401 antes de que el error lo vea (sin toast falso); sin toast en 401 | Aceptado |
| `authGuard` de sesión (presencia, sin red) en `/home` | Ruta privada; el rol se resolverá en guard async aparte | Aceptado |
| `/home` en `RenderMode.Client` (SSR no ve localStorage) | Evita redirección falsa en prerender | Aceptado |

---

## 5. Pendientes

- [ ] `forbidden` + guard de rol (el rol aún no autoriza rutas).
- [ ] Replicar el flujo en GitHub / Apple / login clásico.
- [ ] Tests de integración con backend (hoy solo unitarios).
- [ ] MFA/2FA en frontend (código TOTP).
- [ ] `pnpm lint` (no existe; solo `ng build` + tests).
- [ ] Evaluar cookie `HttpOnly` (BFF) frente a tokens en `localStorage` (riesgo XSS conocido).

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