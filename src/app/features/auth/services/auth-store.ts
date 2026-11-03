import { Router } from '@angular/router';
import { computed, inject, Service, signal } from '@angular/core';
import { ErrorService } from '@core/services/error-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { ApiAuthGoogleRequest, ApiAuthGoogleResponse } from '@features/auth/models/models';
import { AuthGoogleService } from '@features/auth/services/auth-google-service';
import { AuthService } from '@features/auth/services/auth-service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '@core/services/toast-service';

@Service()
export class AuthStore {
  private readonly router = inject(Router);
  private readonly googleAuth = inject(AuthGoogleService);
  private readonly apiAuth = inject(AuthService);
  private readonly errorService = inject(ErrorService);
  private readonly toastService = inject(ToastService);

  private readonly isLoading = signal(false);
  readonly loading = computed(() => this.isLoading());

  async login(): Promise<void> {
    this.isLoading.set(true);

    try {
      const googleToken = await this.googleAuth.getAccessToken();

      const request: ApiAuthGoogleRequest = { googleToken };
      const response: ApiAuthGoogleResponse = await firstValueFrom(this.apiAuth.auth(request));

      localStorage.setItem('jwt_token', response.access_token);

      this.toastService.show('Inicio de sesión exitoso', 'success');
      await this.router.navigate([ROUTES_CONSTANTS.HOME]);
    } catch (error: unknown) {
      const message = (typeof error === 'string' && error)
        || (error instanceof Error && error.message)
        || 'Error al iniciar sesión. Intenta nuevamente.';

      this.errorService.show(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    // Limpia la clave legacy de builds anteriores que guardaban el usuario.
    localStorage.removeItem('user');
    this.router.navigate([ROUTES_CONSTANTS.HOME]);
  }
}
