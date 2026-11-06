import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStoreService } from '@core/services/auth-store-service';
import { AuthService } from '@features/auth/services/auth-service';
import { SKIP_AUTH_INTERCEPTOR } from './auth-context';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

const API_ORIGIN = 'http://127.0.0.1:8000';

/**
 * Añade el Bearer a las llamadas a la API propia y renueva la sesión en 401.
 *
 * Criterio: solo se intenta renovar si la petición fallida IB A AUTENTICADA
 * (llevaba Bearer). Un 401 sin Bearer (login/register público) significa
 * "credenciales incorrectas", no "sesión expirada" → no se refresca.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStoreService = inject(AuthStoreService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(API_ORIGIN);
  const skip = req.context.get(SKIP_AUTH_INTERCEPTOR);
  const token = authStoreService.readStoredToken();
  const wasAuthenticated = isApiRequest && !skip && !!token;
  const authReq = wasAuthenticated
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      if (!isUnauthorized || !wasAuthenticated) {
        return throwError(() => error);
      }

      // Sesión expirada: renovar y reintentar la request original.
      // La petición de refresh se lanza SIN Bearer (no re-entra en este flujo).
      const refreshToken = authStoreService.readRefreshToken();
      if (!refreshToken) {
        closeSession(authStoreService, router);
        return throwError(() => error);
      }

      return authService.refresh(refreshToken).pipe(
        switchMap((tokens) => {
          authStoreService.setSession(tokens.access_token, tokens.refresh_token);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${tokens.access_token}` } }));
        }),
        catchError((refreshError: unknown) => {
          // El refresh falló: la sesión murió → cerrar y volver al login.
          closeSession(authStoreService, router);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function closeSession(authStoreService: AuthStoreService, router: Router): void {
  authStoreService.clearSession();
  void router.navigate([ROUTES_CONSTANTS.AUTH.LOGIN]);
}
