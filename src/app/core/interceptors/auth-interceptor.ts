import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { AuthStoreService } from '@core/services/auth-store-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';

const API_ORIGIN = 'http://127.0.0.1:8000';
const REFRESH_URL = `${API_ORIGIN}/auth/refresh`;

// Endpoints de autenticación pública: un 401 aquí significa "credenciales
// incorrectas" (o token de proveedor inválido), NO "sesión expirada".
// No debe dispararse el refresh ni el logout automático sobre ellos.
const AUTH_PUBLIC_URLS = [
  REFRESH_URL,
  `${API_ORIGIN}/auth/login`,
  `${API_ORIGIN}/auth/register`,
  `${API_ORIGIN}/auth/google`,
  `${API_ORIGIN}/auth/logout`,
];

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStoreService = inject(AuthStoreService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Solo añade el Bearer a llamadas a nuestra propia API.
  const isApiRequest = req.url.startsWith(API_ORIGIN);
  const token = authStoreService.readStoredToken();
  const authReq = isApiRequest && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;

      // No reintentar con refresh sobre endpoints de auth pública ni
      // peticiones externas: un 401 ahí es "credenciales incorrectas".
      const isAuthPublic = AUTH_PUBLIC_URLS.includes(req.url);
      if (!isUnauthorized || !isApiRequest || isAuthPublic) {
        return throwError(() => error);
      }

      return refreshSession(http, authStoreService, router).pipe(
        switchMap((newToken) => next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        }))),
        catchError((refreshError: unknown) => {
          // El refresh también falló: la sesión murió → logout automático.
          logout(authStoreService, router);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function refreshSession(
  http: HttpClient,
  authStoreService: AuthStoreService,
  router: Router,
): Observable<string> {
  const refreshToken = authStoreService.readRefreshToken();
  if (!refreshToken) {
    logout(authStoreService, router);
    return throwError(() => new Error('No refresh token available'));
  }

  return http
    .post<RefreshResponse>(REFRESH_URL, { refresh_token: refreshToken })
    .pipe(map((response) => {
      authStoreService.setSession(response.access_token, response.refresh_token);
      return response.access_token;
    }));
}

function logout(authStoreService: AuthStoreService, router: Router): void {
  authStoreService.clearSession();
  void router.navigate([ROUTES_CONSTANTS.AUTH.LOGIN]);
}
