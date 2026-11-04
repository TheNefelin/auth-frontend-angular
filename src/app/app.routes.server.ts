import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Panel autenticado: depende de la sesión del navegador (localStorage),
    // no puede renderizarse en servidor/prerender.
    path: 'home',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

