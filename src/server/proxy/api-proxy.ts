import { Router, type Request, type Response } from 'express';
import { serverConfig } from '@server/config';
import { environment } from '@environments/environment';

/**
 * Proxy del BFF: reenvía `/ssr-api/*` a la API FastAPI añadiendo `X-API-Key`.
 *
 * Objetivo: el navegador nunca conoce la URL real de la API ni la API Key.
 * El prefijo (`environment.apiUrl`) se elimina antes de reenviar (p. ej.
 * `/ssr-api/auth/me` → `${apiUrl}/auth/me`).
 */
export const apiProxy = Router();

// Fuente única del prefijo: el mismo que usa el cliente.
const PREFIX = environment.apiUrl;

// Cabeceras que gestiona el proxy/servidor y no deben reenviarse tal cual.
const SKIP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'content-encoding',
  'set-cookie',
]);

apiProxy.use(async (req: Request, res: Response) => {
  // originalUrl conserva el prefijo del montaje → lo quitamos.
  const targetUrl = `${serverConfig.apiUrl}${req.originalUrl.slice(PREFIX.length)}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || SKIP_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  headers.set('X-API-Key', serverConfig.apiKey);

  const hasBody = req.body !== undefined && !['GET', 'HEAD'].includes(req.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!SKIP_HEADERS.has(key.toLowerCase())) res.setHeader(key, value);
    });
    // undici une varias Set-Cookie en una sola cadena; las reponemos por separado.
    for (const cookie of upstream.headers.getSetCookie()) {
      res.append('Set-Cookie', cookie);
    }

    res.send(await upstream.text());
  } catch {
    res.status(502).json({
      type: 'bad-gateway',
      title: 'Bad gateway.',
      status: 502,
      detail: 'No se pudo contactar con la API.',
    });
  }
});
