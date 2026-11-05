import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { ErrorService } from "@core/services/error-service";
import { LoggerService } from "@core/services/logger-service";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const loggerService = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Detalle técnico solo en desarrollo; al usuario, mensaje humano.
      loggerService.error('HttpInterceptor', `${req.method} ${req.url} -> ${error.status}`, error);

      // 401 lo gobierna el authInterceptor: o lo recupera (refresh+retry) o hace
      // logout con redirección. Mostrar toast aquí sería ruido duplicado.
      if (error.status !== 401) {
        errorService.show(buildUserMessage(error));
      }

      // No se traga el error: los callers pueden actuar sobre él.
      return throwError(() => error);
    }),
  );
};

function buildUserMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.';
  }

  const body: unknown = error.error;

  // FastAPI 422: detail es un array de { loc, msg, type }.
  if (body && typeof body === 'object') {
    const detail = (body as { detail?: unknown }).detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { loc?: unknown[]; msg?: string; type?: string };
      const field = Array.isArray(first.loc) && first.loc.length > 1
        ? first.loc.slice(1).join('.')
        : '';
      const type = first.type ? ` (${first.type})` : '';

      if (first.msg) {
        return field ? `${field}${type}: ${first.msg}` : first.msg;
      }
      return 'Error de validación en la solicitud.';
    }

    if (typeof detail === 'string' && detail) {
      return detail;
    }
  }

  // Body que no es JSON (p. ej. HTML de un proxy/gateway).
  if (typeof body === 'string' && body) {
    return 'Error inesperado del servidor.';
  }

  return error.status >= 500
    ? 'Error interno del servidor. Intenta de nuevo más tarde.'
    : 'No se pudo completar la operación.';
}
