import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
// [BFF] nuestro: prepara el entorno y monta el proxy (no son del scaffold).
// `env` va PRIMERO: deja process.env listo antes de que config lo lea.
import '@server/env';
import { apiProxy } from '@server/proxy/api-proxy';
import { environment } from '@environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// [BFF] ── Inicio del código propio ─────────────────────────────────────────
// Todo lo de este bloque es nuestro (BFF), NO parte del server.ts original:
// monta el proxy que oculta la URL de la API y añade X-API-Key.
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
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
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
