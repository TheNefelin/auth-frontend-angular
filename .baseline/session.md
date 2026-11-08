# Sesión — frontend-python

> Checkpoint local (fuera de Git): el punto de continuación de la tarea en curso, no un diario.
> Mantenlo corto (≤ ~40 líneas) y reemplaza su contenido en vez de acumular. Sin transcripciones ni secretos.

## Tarea activa

Proyecto completo para MVP. Fase 1 (BFF) + Fase 2 (HttpOnly + CSRF) + CSP con nonces + logging. Todo commiteado.

## Último avance comprobado

- **BFF**: `/ssr-api` → FastAPI con `X-API-Key`; URL y clave ocultas del navegador.
- **HttpOnly**: tokens en cookies `HttpOnly; SameSite=Lax`; BFF gestiona sesión y refresh.
- **CSRF**: doble envío (`csrf_token` cookie + `X-CSRF-Token` header).
- **CSP con nonces**: `script-src` sin `unsafe-inline`/`unsafe-eval` en producción.
- **Logging**: errores no silenciados en producción.
- **Verificado**: `ng build` OK, `ng test` **9/9**, 0 CSP violations en navegador.
- Tokens no en `localStorage`; cookies no visibles a JS.

## Pendientes

- GitHub / Apple (stubs), `/auth/connect`, verificación de email, MFA.
- Endurecer `style-src` (riesgo bajo, aceptado por la industria).
- Alertas de seguridad (hoy solo logs a stdout).
- Pentesting (plan guardado en conversación).

## Nota

Proyecto listo para MVP. Login Google y login clásico funcionan end-to-end.