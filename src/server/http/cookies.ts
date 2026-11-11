/**
 * Utilidades HTTP para cookies del BFF.
 *
 * Responsabilidad ÚNICA: parsear la cabecera Cookie y construir las opciones
 * y valores de `Set-Cookie`. La política de qué cookies existen y cuándo se
 * emiten vive en `services/session.service.ts`.
 */

/** Parsea la cabecera `Cookie` a un mapa nombre → valor. */
export function parseCookies(header: string | undefined): Record<string, string> {
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

/** Construye la cadena de opciones de una cookie `Path=/`. */
export function cookieOpts(maxAgeSec: number, httpOnly: boolean, secure: boolean): string {
  const parts = [`Path=/`, `SameSite=Lax`, `Max-Age=${maxAgeSec}`];
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/** Builder de un `Set-Cookie` completo (con `encodeURIComponent` opcional). */
export function buildSetCookie(
  name: string,
  value: string,
  maxAgeSec: number,
  httpOnly: boolean,
  secure: boolean,
  encode = true,
): string {
  const encoded = encode ? encodeURIComponent(value) : value;
  return `${name}=${encoded}; ${cookieOpts(maxAgeSec, httpOnly, secure)}`;
}
