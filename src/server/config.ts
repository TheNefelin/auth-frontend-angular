/**
 * Configuración del servidor Express (SSR/BFF).
 *
 * Vive SOLO en el servidor: nunca se incluye en el bundle del cliente.
 * Responsabilidad ÚNICA: leer y validar `process.env`. Sin I/O ni efectos:
 * la carga del `.env` corresponde a `env.ts`, que debe importarse antes.
 *
 * La seguridad viene de que estos valores NO llegan al navegador.
 */

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
} as const;
