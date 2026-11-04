import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStoreService } from "@core/services/auth-store-service";
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
  const authStoreService = inject(AuthStoreService);
  const router = inject(Router);

  if (authStoreService.hasSession()) {
    return true;
  }

  return router.createUrlTree([ROUTES_CONSTANTS.AUTH]);
};
