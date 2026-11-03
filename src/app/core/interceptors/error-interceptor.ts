import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { ErrorService } from "@core/services/error-service";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      let message: string;

      if (status === 0) {
        message =
          'No se pudo establecer comunicación con el servidor. ' +
          'Verifica tu conexión o consulta la consola del navegador ' +
          'para comprobar si existe un problema de CORS.';
      } else {
        const detail = error.error?.detail;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          const first = detail[0];
          const field = first?.loc?.slice(1).join('.') || '';
          const type = first?.type ? ` (${first.type})` : '';

          message = field
            ? `${field}${type}: ${first.msg}`
            : first?.msg || 'Error de validación';
        } else {
          message = error.message || 'Error inesperado';
        }
      }

      errorService.show(`[${status}] ${message}`);
      return throwError(() => error);
    }),
  );
};
