import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorService } from "@core/services/error-service";
import { LoggerService } from "@core/services/logger-service";
import { AuthStoreService } from "@core/services/auth-store-service";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const loggerService = inject(LoggerService);
  const authStoreService = inject(AuthStoreService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      loggerService.error('HttpInterceptor', `${req.method} ${req.url} -> ${error.status}`, error);

      // 401 con sesión activa = sesión muerta (el BFF ya intentó refrescar).
      if (error.status === 401 && authStoreService.isAuthenticated()) {
        authStoreService.clearSession();
        void router.navigate([ROUTES_CONSTANTS.AUTH.LOGIN]);
        return throwError(() => error);
      }

      // 401 en /auth/me = el guard preguntando si hay sesión: silencioso,
      // el guard se encarga del redirect a login.
      const isMeRequest = req.url.includes('/auth/me');
      if (error.status === 401 && isMeRequest) {
        return throwError(() => error);
      }

      // Resto de errores (incluido 401 sin sesión = credenciales): se muestra.
      errorService.show(buildUserMessage(error));
      return throwError(() => error);
    }),
  );
};

function buildUserMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.';
  }

  const body: unknown = error.error;

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

  if (typeof body === 'string' && body) {
    return 'Error inesperado del servidor.';
  }

  return error.status >= 500
    ? 'Error interno del servidor. Intenta de nuevo más tarde.'
    : 'No se pudo completar la operación.';
}
