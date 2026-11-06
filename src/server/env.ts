/**
 * Carga del entorno del servidor (SSR/BFF).
 *
 * Responsabilidad ÚNICA: dejar `process.env` listo antes de que alguien lea
 * la configuración. Es lo primero que debe importar el punto de entrada.
 *
 * `ng serve` no pasa `--env-file`, así que cargamos el `.env` nosotros.
 * Solo si el proceso no trae ya la config: lo definido en el entorno
 * (p. ej. Docker, PM2, `node --env-file=`) tiene prioridad sobre el archivo.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.env['API_URL'] && !process.env['API_KEY']) {
  const envFile = resolve(process.cwd(), '.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}
