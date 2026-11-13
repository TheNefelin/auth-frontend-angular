# SKILL.md — auth-frontend-angular (Angular 22)

> Guía de referencia para el stack del frontend. Leelas antes de tocar código.
> El skill completo está en `.baseline/skills/angular/SKILL.md`.

## Skill disponible

| Skill | Ruta | Cuándo usar |
|-------|------|-------------|
| `angular` | `.baseline/skills/angular/SKILL.md` | Componentes, servicios, httpResource/rxResource, listados paginados, formularios, auth, interceptores, performance, a11y |

## Cuándo NO usar

| Situación | Skill |
|-----------|-------|
| Backend de la API | `dotnet` / `fastapi` |
| Diseño visual o mockups previos a implementar | `ui-ux-mockup` |
| Sitios de contenido o SSR con Astro | `astro` |

## Referencias (se leen bajo demanda)

- `angular`: `references/crud-page.md` (listados y estado agrupado), `references/auth.md` (login, sesión, interceptores, XSS), `references/feedback.md` (error/éxito/confirmación), `references/ssr.md` (Express, proxy, render mode, build), `references/filtro-catalogo.md` (filtro por catálogo), `references/componentes-select.md` (selects y modelos), `references/ejemplo-referencia.md` (nombres y casos del proyecto real)

## Notas

- Este proyecto es el frontend Angular 22 (signal-based) del sistema de autenticación.
- El agente no modifica código sin autorización explícita del usuario.
- Lee `.baseline/skills/angular/SKILL.md` para replicar el patrón senior.
- **Prohibido por ser legacy**: `NgModule`, `*ngIf`/`*ngFor`/`*ngSwitch`, decoradores `@Input`/`@Output`/`@ViewChild`, `ChangeDetectorRef.detectChanges()` manual.