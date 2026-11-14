/**
 * Carga del entorno del servidor (SSR/BFF).
 *
 * Responsabilidad ÚNICA: dejar `process.env` listo antes de que alguien lea
 * la configuración. Es lo primero que debe importar el punto de entrada.
 *
 * `ng serve` no pasa `--env-file`, así que cargamos el `.env` nosotros.
 * Los valores del archivo tienen prioridad sobre los del entorno del sistema
 * (override): evita que una variable stale del sistema oculte la config del
 * proyecto (causa común de "API Key inválida" en desarrollo).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFile = resolve(process.cwd(), '.env');
if (existsSync(envFile)) {
  const content = readFileSync(envFile, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Quitar comillas envolventes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;  // override: el .env manda
  }
}
