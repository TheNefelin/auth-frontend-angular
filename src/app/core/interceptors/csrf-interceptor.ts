import { HttpInterceptorFn } from '@angular/common/http';

/**
 * CSRF (doble envío): lee la cookie legible `csrf_token` y la reenvía como
 * cabecera `X-CSRF-Token` en peticiones mutantes hacia el BFF.
 *
 * La protección real la hace el BFF comparando cookie vs cabecera. El atacante
 * puede hacer que el navegador envíe la cookie, pero no puede leerla para
 * ponerla en la cabecera (política same-origin).
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());
  const isApiRequest = req.url.startsWith('/ssr-api');
  if (isMutating && isApiRequest) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      req = req.clone({ setHeaders: { 'X-CSRF-Token': csrfToken } });
    }
  }
  return next(req);
};
