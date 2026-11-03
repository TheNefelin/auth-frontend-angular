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
| Framework | Angular 21+ (signal-based) | Existente |
| Styling | Tailwind CSS + DaisyUI | Por definir |
| Estado | Signals (no `subscribe` manual en componentes) | Por definir |
| HTTP | `httpResource` / `rxResource` | Por definir |
| Tests | vitest | Por definir |
| Build | `ng build` | Por definir |

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

| Decisión | Justificación |
|----------|---------------|
| Estado con signals, sin `subscribe()` en componentes | Estado reactivo declarativo, sin fugas ni valores stale |
| `httpResource`/`rxResource` para lecturas | `isLoading`/`error`/`value` gratis y cancelación automática |
| Un `MutationService` para escrituras | Un solo patrón de guardado, error y cierre de modal |
| `OnPush` en todo | Menos detección de cambios, mejor rendimiento |
| Sin `NgModule`, sin `*ngIf`/`*ngFor` | Piso Angular 21+, control flow `@if`/`@for` |
| DTO `/auth/google` espejo de la respuesta real; la página orquesta el flujo (Google→API→store→navegar); `AuthStore` = estado puro (token, sin Router/HTTP); perfil vía `/auth/me` en fase backend (Aceptado) | Contrato honesto con el backend; servicios con una sola responsabilidad | |

---

## 5. Pendientes (out of scope actual) — El usuario trabajará aquí primero

- [ ] Revisar estructura Angular existente.
- [ ] Conectar mockup con endpoints reales del backend.
- [ ] Implementar formularios de login con Angular signals.
- [ ] Implementar interceptores de autenticación (JWT).
- [ ] Implementar MFA/2FA en frontend (código TOTP).
- [ ] Agregar protección contra XSS y CSRF.

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