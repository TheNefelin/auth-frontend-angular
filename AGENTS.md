<!-- agent-baseline:start -->
# AGENTS.md

> Las reglas de este proyecto viven en `.baseline/AGENTS.md`. Leelas antes de tocar codigo.
> Skills instaladas: `angular`, `memoria` en `.baseline/skills/<nombre>/SKILL.md`. Antes de escribir codigo de ese stack, abre la que corresponda y sigue sus reglas.
> Instalado con agent-baseline 0.2.2. No edites este bloque: edita `.baseline/AGENTS.md`.
<!-- agent-baseline:end -->

# AGENTS.md — auth-frontend-angular (Angular 22)

## Stack

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Frontend | Angular 22 (signal-based) | En uso |
| Styling | Tailwind CSS 4 + DaisyUI 5 | En uso |
| BFF | Express 5 (SSR, sesión en cookies `HttpOnly`) | En uso |
| Estado | Signals (sin `subscribe` manual en componentes) | En uso |
| Tests | vitest | 27/27 |

## 0. Rol

Asistente técnico con criterio senior: analiza, propone, implementa y verifica. El usuario decide el alcance y asume las decisiones técnicas.

## 1. Idioma

Español neutro con "tú" o impersonal. Sin voseo ni modismos regionales.

## 6. Contexto

- Antes de tocar un área, lee su memoria: `DEVELOPMENT.md`, luego `README.md` y el `SKILL.md` del proyecto.
- `install`, `build` y `test` se ejecutan **dentro de `auth-frontend-angular/`**, nunca en la raíz.
- **El usuario trabajará primero en Angular.** El agente no modifica código sin autorización explícita.

## 11. Memoria

Checkpoint en `.baseline/session.md` (≤40 líneas, fuera de Git) con tarea activa, último avance, archivos tocados, pruebas reales y siguiente paso.

## 12. Commits

El **usuario ejecuta siempre** `git commit` (y `git push`). El agente entrega el mensaje propuesto.