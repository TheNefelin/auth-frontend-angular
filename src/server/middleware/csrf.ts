/**
 * Cross-Site Request Forgery (CSRF) — doble envío.
 *
 * El BFF emite una cookie `csrf_token` legible por JS (no HttpOnly). El
 * cliente la reenvía como cabecera `X-CSRF-Token` en peticiones mutantes
 * (POST/PUT/DELETE/PATCH). Como un sitio ajeno no puede leer la cookie para
 * construir la cabecera, su petición se rechaza con 403.
 *
 * Solo se exige si el usuario trae cookie `csrf_token` (sesión activa).
 */

import type { NextFunction, Request, Response } from 'express';
import { parseCookies } from '@server/http/cookies';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export function csrfGuard(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const cookies = parseCookies(req.headers.cookie);
  if (!cookies['csrf_token']) {
    next();
    return;
  }

  const header = req.headers['x-csrf-token'];
  const headerValue = Array.isArray(header) ? header[0] : header;

  if (!headerValue || headerValue !== cookies['csrf_token']) {
    res.status(403).json({
      type: 'csrf-failed',
      title: 'Cross-Site Request Forgery token mismatch.',
      status: 403,
      detail: 'Token CSRF inválido o ausente.',
    });
    return;
  }

  next();
}
