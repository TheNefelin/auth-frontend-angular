/**
 * Proxy inverso del BFF: reenvía `/ssr-api/*` a la API FastAPI.
 *
 * Fase 2 + Cross-Site Request Forgery (CSRF): el BFF es el dueño de la sesión.
 *   - Lee la cookie `access_token` y pone el `Authorization: Bearer`.
 *   - En login/register/google/refresh: extrae los tokens de la respuesta,
 *     los guarda en cookies HttpOnly y devuelve la respuesta SIN tokens.
 *     Además emite una cookie `csrf_token` legible por JS (doble envío).
 *   - En 401: intenta refrescar con `refresh_token` y reintenta una vez.
 *   - En logout: borra las cookies.
 *   - CSRF (`middleware/csrf.ts`): en peticiones mutantes comprueba la
 *     cabecera `X-CSRF-Token` contra la cookie `csrf_token`.
 *
 * El navegador nunca ve un token.
 */
import { Router, type Request, type Response } from 'express';
import { serverConfig } from '@server/config';
import { environment } from '@environments/environment';
import { parseCookies } from '@server/http/cookies';
import { SKIP_HEADERS, forwardHeaders } from '@server/http/proxy-headers';
import { csrfGuard } from '@server/middleware/csrf';
import { jsonErrorHandler } from '@server/middleware/json-error';
import {
  ACCESS_TOKEN_TTL_SEC,
  clearSessionCookies,
  emitSessionCookies,
  refreshSession,
} from '@server/services/session.service';

export const apiProxy = Router();

const apiPrefix = environment.apiUrl;
const apiUrl = serverConfig.apiUrl;
const apiKey = serverConfig.apiKey;

const AUTH_TOKEN_ENDPOINTS = /^\/auth\/(login|register|google|refresh)(\?|$)/;
const LOGOUT_ENDPOINT = /^\/auth\/logout(\?|$)/;

// Secure solo en producción real (HTTPS). En localhost (dev) no se pone:
// las cookies Secure no se envían por HTTP y la sesión se perdería.
function isSecureRequest(req: Request): boolean {
  if (process.env['PRODUCTION'] !== 'true') return false;
  const host = (req.headers.host || '').toLowerCase();
  if (host.includes('localhost') || host.includes('127.0.0.1')) return false;
  return true;
}

// Guarda de Cross-Site Request Forgery en peticiones mutantes.
apiProxy.use(csrfGuard);

apiProxy.use(async (req: Request, res: Response) => {
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
    // El backend no responde: JSON de error uniforme, nunca HTML del error handler.
    res.status(502).json({
      type: 'upstream-unavailable',
      title: 'Upstream Service Unavailable.',
      status: 502,
      detail: 'No se pudo contactar la API.',
    });
    return;
  }

  const isTokenEndpoint = AUTH_TOKEN_ENDPOINTS.test(path);
  const isLogout = LOGOUT_ENDPOINT.test(path);

  if (upstream.status === 401 && cookies['refresh_token'] && !isTokenEndpoint && !isLogout) {
    const refreshed = await refreshSession(cookies['refresh_token']);

    if (refreshed?.accessToken) {
      emitSessionCookies(res, {
        access_token: refreshed.accessToken,
        refresh_token: refreshed.refreshToken,
        expires_in: refreshed.expiresIn ?? ACCESS_TOKEN_TTL_SEC,
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
      clearSessionCookies(res, secure);
    }
  }

  if (isTokenEndpoint && upstream.ok) {
    const text = await upstream.text();
    let data: Record<string, unknown> | null = null;
    try { data = JSON.parse(text) as Record<string, unknown>; } catch { data = null; }

    if (data && (typeof data['access_token'] === 'string' || typeof data['refresh_token'] === 'string')) {
      emitSessionCookies(res, data, secure);
      // La respuesta al cliente sale SIN tokens: solo datos de negocio.
      const { access_token: _a, refresh_token: _r, ...rest } = data;
      res.status(upstream.status);
      forwardHeaders(upstream, res);
      res.send(JSON.stringify(rest));
      return;
    }

    res.status(upstream.status);
    forwardHeaders(upstream, res);
    res.send(text);
    return;
  }

  if (isLogout) {
    clearSessionCookies(res, secure);
  }

  const text = await upstream.text();
  res.status(upstream.status);
  forwardHeaders(upstream, res);
  res.send(text);
});

// Errores de parseo del body (express.json()) → 400 JSON, nunca HTML.
apiProxy.use(jsonErrorHandler);
