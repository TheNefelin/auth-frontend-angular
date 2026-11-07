import { randomBytes } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * CSP con nonces para producción.
 *
 * Genera un nonce por request. El CSP restrictivo se envía como cabecera
 * HTTP (tiene prioridad sobre el `<meta>`). El nonce se inyecta en los
 * scripts inline del HTML (post-proceso) para que pasen la política.
 *
 * En desarrollo (`PRODUCTION !== 'true'`) no se hace nada: el `<meta>`
 * permisivo del index.html sigue aplicando.
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

export function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "font-src 'self' https: data:",
    "connect-src 'self' https:",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/**
 * Añade el nonce a los scripts inline de un HTML (producción).
 * No toca scripts con src=. Reemplaza nonces vacíos (nonce="") que Angular
 * deja en el build, y añade nonce a los que no lo tienen.
 */
export function injectNonce(html: string, nonce: string): string {
  return html.replace(
    /<script(?![^>]*\bsrc=)([^>]*)>/g,
    (_match, attrs: string) => {
      if (attrs.includes('nonce=')) {
        return `<script${attrs.replace(/nonce="[^"]*"/, `nonce="${nonce}"`)}>`;
      }
      return `<script nonce="${nonce}"${attrs}>`;
    },
  );
}
