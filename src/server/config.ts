/**
 * Configuración del servidor Express (SSR/BFF).
 *
 * Vive SOLO en el servidor: nunca se incluye en el bundle del cliente.
 * Lee de `process.env` y, si existe, carga el `.env` del frontend.
 *
 * Responsabilidad: leer y validar las variables del servidor; la seguridad
 * viene de que estos valores NO llegan al navegador.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// `ng serve` no pasa `--env-file`, así que cargamos el .env nosotros.
// Solo si el proceso aún no trae la config: lo definido en el entorno
// (p. ej. Docker, PM2) tiene prioridad sobre el archivo.
if (!process.env['API_URL'] && !process.env['API_KEY']) {
  const envFile = resolve(process.cwd(), '.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno del servidor: ${name}. ` +
      'Defínela en el .env del frontend (ver .env.demo).',
    );
  }
  return value;
}

export const serverConfig = {
  /** URL interna de la API FastAPI (no expuesta al navegador). */
  apiUrl: required('API_URL'),
  /** API Key que el BFF añade a cada llamada a FastAPI (nunca al navegador). */
  apiKey: required('API_KEY'),
  /** Client ID de Google (público, pero servido por el BFF si aplica). */
  googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
} as const;
