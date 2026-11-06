import { HttpContextToken } from '@angular/common/http';

/**
 * Marca una request para que el `authInterceptor` NO la intercepte
 * (no añade Bearer ni intenta renovar). Se usa en la propia llamada de
 * `/auth/refresh` para evitar re-entrar en el flujo de 401 (ciclo).
 */
export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
