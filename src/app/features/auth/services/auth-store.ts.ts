import { Router } from '@angular/router';
import { computed, inject, Service, signal } from '@angular/core';
import { ErrorService } from '@core/services/error-service';
import { ROUTES_CONSTANTS } from '@shared/constants/routes-constant';
import { Role, AuthUser, ApiAuthGoogleRequest, ApiAuthGoogleResponse } from '@features/auth/models/models';
import { AuthGoogleService } from '@features/auth/services/auth-google-service';
import { AuthService } from '@features/auth/services/auth-service';
import { firstValueFrom } from 'rxjs';

@Service()
export class AuthStoreTs {
  private router = inject(Router);
  private googleAuth = inject(AuthGoogleService);
  private apiAuth = inject(AuthService);
  private errorModal = inject(ErrorService);
  
  // 🔹 Signals internas
  private currentUser = signal<AuthUser | null>(this.getStoredUser());
  private isLoading = signal(false);

  // 🔹 Signals públicas
  user = computed(() => this.currentUser());
  isAuthenticated = computed(() => !!this.currentUser());
  loading = computed(() => this.isLoading());

  private getStoredUser(): AuthUser | null {
    const saved = localStorage.getItem('user');
    if (!saved) return null;

    try {
      return JSON.parse(saved) as AuthUser;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

   // 🔹 Login principal
  async login(): Promise<void> {
    try {
      this.isLoading.set(true);

      // 1️⃣ Obtener access_token de Google
      const googleToken = await this.googleAuth.getAccessToken();

      // 2️⃣ Enviar token al backend
      const request: ApiAuthGoogleRequest = { googleToken };
      const response: ApiAuthGoogleResponse = await firstValueFrom(this.apiAuth.auth(request));

      // 3️⃣ Guardar JWT
      localStorage.setItem('jwt_token', response.token);

      // 4️⃣ Guardar usuario
      const user: AuthUser = response.user;
      this.currentUser.set(user);
      localStorage.setItem('user', JSON.stringify(user));

      // 5️⃣ Redirigir según profileComplete
      let navigateTo = '';

      switch(user.role) {
        case Role.Reader:
          navigateTo = ROUTES_CONSTANTS.HOME;
          break;
        case Role.Admin:
          navigateTo = ROUTES_CONSTANTS.HOME;
          break;
        default:
          navigateTo = ROUTES_CONSTANTS.HOME
      }

      this.router.navigate([navigateTo]);
    } catch (error: unknown) {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: unknown }).status) || 0
        : 0;
      const message = (typeof error === 'string' && error)
        || (error instanceof Error && error.message)
        || 'Error al iniciar sesión. Intenta nuevamente.';

      //this.errorModal.openError(status, message);
    } finally {
      this.isLoading.set(false);
    }
  }

  // 🔹 Logout
  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt_token');
    this.router.navigate([ROUTES_CONSTANTS.HOME]);
  }
}
