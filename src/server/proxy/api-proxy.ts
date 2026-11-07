import { randomUUID } from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { serverConfig } from '@server/config';
import { environment } from '@environments/environment';

/**
 * Proxy del BFF: reenvía `/ssr-api/*` a la API FastAPI añadiendo `X-API-Key`.
 *
 * Fase 2 + CSRF: el BFF es el dueño de la sesión.
 *   - Lee la cookie `access_token` y pone el `Authorization: Bearer`.
 *   - En login/register/google/refresh: extrae los tokens de la respuesta,
 *     los guarda en cookies HttpOnly y devuelve la respuesta SIN tokens.
 *     Además emite una cookie `csrf_token` legible (doble envío).
 *   - En 401: intenta refrescar con `refresh_token` y reintenta una vez.
 *   - En logout: borra las cookies.
 *   - CSRF: en peticiones mutantes (POST/PUT/DELETE/PATCH) comprueba que la
 *     cabecera `X-CSRF-Token` coincida con la cookie `csrf_token`.
 *
 * El navegador nunca ve un token.
 */
export const apiProxy = Router();

const apiPrefix = environment.apiUrl;
const apiUrl = serverConfig.apiUrl;
const apiKey = serverConfig.apiKey;

const SKIP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'content-encoding',
  'set-cookie',
  'cookie',
  'x-csrf-token',
]);

const AUTH_TOKEN_ENDPOINTS = /^\/auth\/(login|register|google|refresh)(\?|$)/;
const LOGOUT_ENDPOINT = /^\/auth\/logout(\?|$)/;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const isProd = process.env['NODE_ENV'] === 'production';

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function cookieOpts(maxAge: number, httpOnly: boolean): string {
  const parts = [`Path=/`, `SameSite=Lax`, `Max-Age=${maxAge}`];
  if (httpOnly) parts.push('HttpOnly');
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

function setAccessCookie(res: Response, value: string, maxAgeSec: number): void {
  res.append('Set-Cookie', `access_token=${encodeURIComponent(value)}; ${cookieOpts(maxAgeSec, true)}`);
}

function setRefreshCookie(res: Response, value: string, maxAgeSec: number): void {
  res.append('Set-Cookie', `refresh_token=${encodeURIComponent(value)}; ${cookieOpts(maxAgeSec, true)}`);
}

// Cookie legible por JS (NO HttpOnly): el cliente la lee y la reenvía como
// cabecera X-CSRF-Token en peticiones mutantes (doble envío).
function setCsrfCookie(res: Response, value: string, maxAgeSec: number): void {
  res.append('Set-Cookie', `csrf_token=${value}; ${cookieOpts(maxAgeSec, false)}`);
}

function clearCookies(res: Response): void {
  res.append('Set-Cookie', `access_token=; ${cookieOpts(0, true)}`);
  res.append('Set-Cookie', `refresh_token=; ${cookieOpts(0, true)}`);
  res.append('Set-Cookie', `csrf_token=; ${cookieOpts(0, false)}`);
}

function forwardHeaders(upstream: globalThis.Response, res: Response): void {
  upstream.headers.forEach((value, key) => {
    if (!SKIP_HEADERS.has(key.toLowerCase())) res.setHeader(key, value);
  });
}

apiProxy.use(async (req: Request, res: Response) => {
  const path = req.originalUrl.slice(apiPrefix.length);
  const targetUrl = `${apiUrl}${path}`;
  const cookies = parseCookies(req.headers.cookie);
  const method = req.method.toUpperCase();

  // --- CSRF: doble envío en peticiones mutantes con sesión activa ---
  if (MUTATING_METHODS.has(method) && cookies['csrf_token']) {
    const header = req.headers['x-csrf-token'];
    const headerValue = Array.isArray(header) ? header[0] : header;
    if (!headerValue || headerValue !== cookies['csrf_token']) {
      res.status(403).json({
        type: 'csrf-failed',
        title: 'CSRF token mismatch.',
        status: 403,
        detail: 'Token CSRF inválido o ausente.',
      });
      return;
    }
  }

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

  let upstream = await fetch(targetUrl, { method: req.method, headers, body });

  const isTokenEndpoint = AUTH_TOKEN_ENDPOINTS.test(path);
  const isLogout = LOGOUT_ENDPOINT.test(path);

  if (upstream.status === 401 && cookies['refresh_token'] && !isTokenEndpoint && !isLogout) {
    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ refresh_token: cookies['refresh_token'] }),
    });
    if (refreshRes.ok) {
      const rd = await refreshRes.json() as Record<string, unknown>;
      if (typeof rd['access_token'] === 'string') setAccessCookie(res, rd['access_token'] as string, Number(rd['expires_in'] ?? 900));
      if (typeof rd['refresh_token'] === 'string') setRefreshCookie(res, rd['refresh_token'] as string, 60 * 60 * 24);
      // Regenera el CSRF junto al access token.
      setCsrfCookie(res, randomUUID(), Number(rd['expires_in'] ?? 900));
      headers.set('Authorization', `Bearer ${rd['access_token']}`);
      upstream = await fetch(targetUrl, { method: req.method, headers, body });
    } else {
      clearCookies(res);
    }
  }

  if (isTokenEndpoint && upstream.ok) {
    const text = await upstream.text();
    let data: Record<string, unknown> | null = null;
    try { data = JSON.parse(text) as Record<string, unknown>; } catch { data = null; }
    if (data && (typeof data['access_token'] === 'string' || typeof data['refresh_token'] === 'string')) {
      if (typeof data['access_token'] === 'string') setAccessCookie(res, data['access_token'] as string, Number(data['expires_in'] ?? 900));
      if (typeof data['refresh_token'] === 'string') setRefreshCookie(res, data['refresh_token'] as string, 60 * 60 * 24);
      // CSRF: cookie legible por JS (doble envío).
      setCsrfCookie(res, randomUUID(), Number(data['expires_in'] ?? 900));
      const { access_token, refresh_token, ...rest } = data;
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
    clearCookies(res);
  }

  const text = await upstream.text();
  res.status(upstream.status);
  forwardHeaders(upstream, res);
  res.send(text);
});
