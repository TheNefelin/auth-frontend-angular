import { RenderMode, ServerRoute } from '@angular/ssr';

// Render mode por ruta:
// - ''     → Prerender: login público y estático.
// - 'home' → Client: panel autenticado, depende de la sesión del navegador
//            (cookies HttpOnly, que el servidor no puede leer en prerender).
// - '**'   → Prerender: página 404 pública y estática.
export const serverRoutes: ServerRoute[] = [
  { path: '',     renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Client },
  { path: '**',   renderMode: RenderMode.Prerender },
];
