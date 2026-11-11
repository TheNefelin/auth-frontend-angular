/**
 * Utilidades de cabeceras para el proxy inverso.
 *
 * Responsabilidad ÚNICA: qué cabeceras se reenvían tal cual del upstream
 * al cliente y cuáles se descartan por seguridad o por el contrato HTTP.
 */

import type { Response } from 'express';

/** Cabeceras que NO se reenvían del upstream al cliente. */
export const SKIP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'content-encoding',
  'set-cookie',
  'cookie',
  'x-csrf-token',
]);

/** Copia las cabeceras del upstream en la respuesta, filtrando las excluidas. */
export function forwardHeaders(upstream: globalThis.Response, res: Response): void {
  upstream.headers.forEach((value, key) => {
    if (!SKIP_HEADERS.has(key.toLowerCase())) res.setHeader(key, value);
  });
}
