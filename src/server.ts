import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
// [BFF] nuestro: prepara el entorno, CSP con nonce y monta el proxy (no son del scaffold).
// `env` va PRIMERO: deja process.env listo antes de que config lo lea.
import '@server/env';
import { apiProxy } from '@server/proxy/api-proxy';
import { environment } from '@environments/environment';
import { generateNonce, buildCsp, injectNonce } from '@server/middleware/csp';
import { getAllowedHosts } from '@server/middleware/allowed-hosts';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: getAllowedHosts(),
});

const isProd = process.env['PRODUCTION'] === 'true';

// [BFF] ── Inicio del código propio ─────────────────────────────────────────
// Todo lo de este bloque es nuestro (BFF), NO parte del server.ts original:
// CSP con nonce (producción) y proxy /ssr-api que oculta la URL de la API.
const apiPrefix = environment.apiUrl;
app.use(apiPrefix, express.json());
app.use(apiPrefix, apiProxy);
// [BFF] ── Fin del código propio ────────────────────────────────────────────

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 * En producción: genera nonce, fija CSP, inyecta nonce en scripts inline.
 */
app.use(async (req, res, next) => {
  const nonce = isProd ? generateNonce() : undefined;

  if (isProd && nonce) {
    res.setHeader('Content-Security-Policy', buildCsp(nonce));
  }

  try {
    const response = await angularApp.handle(req);
    if (!response) {
      next();
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (isProd && nonce && contentType.includes('text/html')) {
      const body = await response.text();
      const modified = injectNonce(body, nonce);
      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'etag') res.setHeader(key, value);
      });
      // Evitar que el navegador cachee el HTML: cada request genera un nonce nuevo.
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.send(modified);
    } else {
      await writeResponseToNodeResponse(response, res);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
