/**
 * Proxy genérico del BFF: reenvía `/ssr-api/*` a la API FastAPI.
 *
 * NO gestiona cookies de sesión ni tokens: esa responsabilidad vive en
 * `auth-proxy.ts` (montado antes en `/ssr-api/auth`). Este router es el
 * catch-all para endpoints CRUD/genéricos (language, project, technology,
 * url, url_grp, etc.) y para cualquier feature futura.
 *
 * Responsabilidades:
 *   - Forwarding con `Authorization: Bearer` desde la cookie `access_token`.
 *   - En 401: intenta refrescar con `refresh_token` y reintenta una vez;
 *     si el refresh falla, borra las cookies de sesión.
 *   - Upstream caído → 502 JSON (nunca HTML).
 *   - Body JSON inválido → 400 JSON (`jsonErrorHandler`).
 *   - CSRF (`middleware/csrf.ts`): en peticiones mutantes comprueba la
 *     cabecera `X-CSRF-Token` contra la cookie `csrf_token`.
 */

import { Router, type Request, type Response } from 'express';
import { serverConfig } from '@server/config';
import { environment } from '@environments/environment';
import { parseCookies } from '@server/http/cookies';
import { SKIP_HEADERS, forwardHeaders } from '@server/http/proxy-headers';
import { csrfGuard } from '@server/middleware/csrf';
import { jsonErrorHandler } from '@server/middleware/json-error';
import {
  clearSessionCookies,
  refreshSession,
} from '@server/services/session.service';

export const apiProxy = Router();

const apiPrefix = environment.apiUrl;   // '/ssr-api'

// Secure solo en producción real (HTTPS).
function isSecureRequest(req: Request): boolean {
  if (process.env['PRODUCTION'] !== 'true') return false;
  const host = (req.headers.host || '').toLowerCase();
  if (host.includes('localhost') || host.includes('127.0.0.1')) return false;
  return true;
}

// Guarda de Cross-Site Request Forgery en peticiones mutantes.
apiProxy.use(csrfGuard);

apiProxy.use(async (req: Request, res: Response) => {
  const apiUrl = serverConfig.apiUrl;
  const apiKey = serverConfig.apiKey;
  if (!apiUrl || !apiKey) {
    res.status(500).json({ detail: 'Falta configurar API_URL y API_KEY en el servidor.' });
    return;
  }
  const path = req.originalUrl.slice(apiPrefix.length);
  const targetUrl = `${apiUrl}${path}`;
  const cookies = parseCookies(req.headers.cookie);
  const method = req.method.toUpperCase();
  const secure = isSecureRequest(req);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || SKIP_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  if (cookies['access_token']) {
    headers.set('Authorization', `Bearer ${cookies['access_token']}`);
  } else if (req.headers.authorization) {
    headers.set('Authorization', Array.isArray(req.headers.authorization)
      ? req.headers.authorization.join(',')
      : req.headers.authorization);
  }
  headers.set('X-API-Key', apiKey);

  const hasBody = req.body !== undefined && !['GET', 'HEAD'].includes(method);
  const body = hasBody ? JSON.stringify(req.body) : undefined;

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(targetUrl, { method: req.method, headers, body });
  } catch {
    res.status(502).json({
      type: 'upstream-unavailable',
      title: 'Upstream Service Unavailable.',
      status: 502,
      detail: 'No se pudo contactar la API.',
    });
    return;
  }

  // Refresh on 401: intenta renovar la sesión y reintenta una vez.
  if (upstream.status === 401 && cookies['refresh_token']) {
    const refreshed = await refreshSession(cookies['refresh_token']);
    if (refreshed?.accessToken) {
      // Emitir cookies nuevas (el BFF es dueño de la sesión).
      const { emitSessionCookies } = await import('@server/services/session.service');
      emitSessionCookies(res, {
        access_token: refreshed.accessToken,
        refresh_token: refreshed.refreshToken,
        expires_in: refreshed.expiresIn ?? 900,
      }, secure);
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      try {
        upstream = await fetch(targetUrl, { method: req.method, headers, body });
      } catch {
        res.status(502).json({
          type: 'upstream-unavailable',
          title: 'Upstream Service Unavailable.',
          status: 502,
          detail: 'No se pudo contactar la API tras refrescar la sesión.',
        });
        return;
      }
    } else {
      const { clearSessionCookies } = await import('@server/services/session.service');
      clearSessionCookies(res, secure);
    }
  }

  const text = await upstream.text();
  res.status(upstream.status);
  forwardHeaders(upstream, res);
  res.send(text);
});

// Errores de parseo del body (express.json()) → 400 JSON, nunca HTML.
apiProxy.use(jsonErrorHandler);