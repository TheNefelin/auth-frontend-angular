import { Router, type Request, type Response } from 'express';
import { serverConfig } from '../config';

/**
 * Proxy del BFF: reenvía `/ssr-api/*` a la API FastAPI añadiendo `X-API-Key`.
 *
 * Objetivo: el navegador nunca conoce la URL real de la API ni la API Key.
 * El prefijo `/ssr-api` se elimina antes de reenviar (p. ej.
 * `/ssr-api/auth/me` → `${apiUrl}/auth/me`).
 *
 * NO montado todavía en server.ts (Paso 1: solo infraestructura).
 */
export const apiProxy = Router();

const PREFIX = '/ssr-api';

// Cabeceras del cliente que NO deben reenviarse (las gestiona el proxy/servidor).
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
]);

apiProxy.use(async (req: Request, res: Response) => {
  // req.originalUrl empieza con /ssr-api → se quita el prefijo.
  const path = req.originalUrl.replace(PREFIX, '');
  const targetUrl = `${serverConfig.apiUrl}${path}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || HOP_BY_HOP.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  headers.set('X-API-Key', serverConfig.apiKey);

  const hasBody = !['GET', 'HEAD'].includes(req.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) res.setHeader(key, value);
    });

    const body = await upstream.text();
    res.send(body);
  } catch {
    res.status(502).json({
      type: 'bad-gateway',
      title: 'Bad gateway.',
      status: 502,
      detail: 'No se pudo contactar con la API.',
    });
  }
});
