import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { AuthStoreService } from "@core/services/auth-store-service";
import { AuthService } from "@features/auth/services/auth-service";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";

/**
 * Protege rutas que requieren sesión.
 *
 * Comprueba la PRESENCIA de sesión (access o refresh), sin llamada de red:
 * si el access está expirado pero hay refresh, deja pasar y el
 * `authInterceptor` renueva en la primera petición.
 *
 * La autorización por rol NO vive aquí: el rol no está disponible en el
 * cliente de forma síncrona; cuando exista (claim en el JWT o /auth/me),
 * se implementará como guard async aparte.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const authStoreService = inject(AuthStoreService);
  const router = inject(Router);

  // Fase 2: el cliente no puede leer la cookie HttpOnly, así que la fuente de
  // verdad es el servidor. La guardia pregunta /auth/me (asíncrona).
  return authService.me().pipe(
    map((profile) => {
      authStoreService.setSession();
      return true;
    }),
    catchError(() => {
      authStoreService.clearSession();
      return of(router.createUrlTree([ROUTES_CONSTANTS.AUTH.LOGIN]));
    }),
  );
};
