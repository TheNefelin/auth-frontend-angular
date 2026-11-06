import type { RequestHandler } from 'express';

/**
 * Cabeceras de seguridad HTTP del servidor SSR.
 *
 * Nota: hoy el CSP activo es el `<meta>` de `index.html` (aplica en dev y prod).
 * Este middleware aplica el CSP también como cabecera HTTP en SSR/producción,
 * que es la forma correcta (cubre directivas que el `<meta>` no puede).
 */
export const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
      "connect-src 'self' https: http://localhost:8000 http://127.0.0.1:8000 ws: wss:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https: data:; " +
      'frame-src https://accounts.google.com;',
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};
