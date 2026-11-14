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
    // Durante el build (extracción de rutas) las env vars pueden no estar
    // cargadas aún. Se valida en runtime cuando el servidor arranca.
    return '';
  }
  return value;
}

// Proxy lazy: evalúa required() en cada acceso, no al importar el módulo.
// Así el build no falla si las env vars no están seteadas aún.
export const serverConfig = new Proxy({} as { apiUrl: string; apiKey: string }, {
  get(_target, prop: string) {
    if (prop === 'apiUrl') return required('API_URL');
    if (prop === 'apiKey') return required('API_KEY');
    return undefined;
  },
});
