/**
 * Servicio de sesión del BFF.
 *
 * Responsabilidad ÚNICA: emitir, refrescar y borrar las cookies de sesión:
 *   - access_token  → HttpOnly, sesión corta (por defecto 900 s).
 *   - refresh_token → HttpOnly, sesión larga (24 h).
 *   - csrf_token    → Legible por JS, doble envío (SameSite=Lax).
 *
 * La cookie `csrf_token` la emite el cliente del backend; aquí se regenera
 * junto al access token para que siempre coincidan.
 */

import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { serverConfig } from '@server/config';
import { buildSetCookie } from '@server/http/cookies';

/** TTL por defecto del access token (segundos). */
export const ACCESS_TOKEN_TTL_SEC = 900;
/** TTL del refresh token (segundos): 24 h. */
export const REFRESH_TOKEN_TTL_SEC = 60 * 60 * 24;

/** Estructura mínima devuelta por `/auth/refresh` y por los login-type. */
interface SessionTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

/** Emite las tres cookies de sesión (o las que traiga `data`). */
export function emitSessionCookies(res: Response, data: Record<string, unknown>, secure: boolean): void {
  const expiresIn = Number(data['expires_in'] ?? ACCESS_TOKEN_TTL_SEC);

  if (typeof data['access_token'] === 'string') {
    res.append('Set-Cookie', buildSetCookie('access_token', data['access_token'], expiresIn, true, secure));
  }
  if (typeof data['refresh_token'] === 'string') {
    res.append('Set-Cookie', buildSetCookie('refresh_token', data['refresh_token'], REFRESH_TOKEN_TTL_SEC, true, secure));
  }
  // CSRF: cookie legible por JS (doble envío). Se regenera siempre con la sesión.
  res.append('Set-Cookie', buildSetCookie('csrf_token', randomUUID(), expiresIn, false, secure, false));
}

/** Borra las tres cookies de sesión (logout o refresh fallido). */
export function clearSessionCookies(res: Response, secure: boolean): void {
  res.append('Set-Cookie', buildSetCookie('access_token', '', 0, true, secure, false));
  res.append('Set-Cookie', buildSetCookie('refresh_token', '', 0, true, secure, false));
  res.append('Set-Cookie', buildSetCookie('csrf_token', '', 0, false, secure, false));
}

/**
 * Intenta refrescar la sesión contra el backend.
 * Devuelve los tokens nuevos o `null` si el refresh falla (sesión inválida).
 */
export async function refreshSession(refreshToken: string): Promise<SessionTokens | null> {
  try {
    const refreshRes = await fetch(`${serverConfig.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': serverConfig.apiKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshRes.ok) return null;

    const data = (await refreshRes.json()) as Record<string, unknown>;
    if (typeof data['access_token'] !== 'string') return null;

    return {
      accessToken: data['access_token'],
      refreshToken: typeof data['refresh_token'] === 'string' ? data['refresh_token'] : undefined,
      expiresIn: Number(data['expires_in'] ?? ACCESS_TOKEN_TTL_SEC),
    };
  } catch {
    return null;
  }
}
