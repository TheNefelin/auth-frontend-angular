import { Component, inject, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthGoogleComponent } from "@features/auth/components/auth-google-component/auth-google-component";
import { AuthGithubComponent } from "@features/auth/components/auth-github-component/auth-github-component";
import { AuthAppleComponent } from "@features/auth/components/auth-apple-component/auth-apple-component";
import { AuthLoginComponent } from "@features/auth/components/auth-login-component/auth-login-component";
import { AuthGoogleService } from "@features/auth/services/auth-google-service";
import { AuthService } from "@features/auth/services/auth-service";
import { ApiAuthGoogleRequest } from "@features/auth/models/models";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";
import { ToastService } from "@core/services/toast-service";
import { ErrorService } from "@core/services/error-service";
import { LoggerService } from "@core/services/logger-service";
import { AuthStoreService } from "@core/services/auth-store-service";

@Component({
  imports: [AuthGoogleComponent, AuthGithubComponent, AuthAppleComponent, AuthLoginComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {
  private readonly authGoogleService = inject(AuthGoogleService);
  private readonly authService = inject(AuthService);
  private readonly store = inject(AuthStoreService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly errorService = inject(ErrorService);
  private readonly logger = inject(LoggerService);

  protected readonly loadingAuth = signal<boolean>(false);
  protected readonly loadingApple = signal<boolean>(false);
  protected readonly loadingGitHub = signal<boolean>(false);
  protected readonly loadingGoogle = signal<boolean>(false);
  protected readonly disabled = signal<boolean>(false);

  protected async loginAuth(): Promise<void> {
    this.loadingAuth.set(true);
    this.disabled.set(true);
  }

  protected async loginApple(): Promise<void> {
    this.loadingApple.set(true);
    this.disabled.set(true);
  }

  protected async loginGoogle(): Promise<void> {
    this.loadingGoogle.set(true);
    this.disabled.set(true);

    try {
      const googleToken = await this.authGoogleService.getAccessToken();

      const request: ApiAuthGoogleRequest = { googleToken };
      const response = await firstValueFrom(this.authService.auth(request));

      this.store.setSession(response.access_token);

      this.toastService.show('Inicio de sesión exitoso', 'success');
      await this.router.navigate([ROUTES_CONSTANTS.HOME]);
    } catch (error: unknown) {
      this.logger.error('AuthPage', 'loginGoogle', error);
      this.errorService.show(this.describeError(error));
    } finally {
      this.loadingGoogle.set(false);
      this.disabled.set(false);
    }
  }

  protected async loginGitHub(): Promise<void> {
    this.loadingGitHub.set(true);
    this.disabled.set(true);
  }

  private describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
      }
      const detail = (error.error as { detail?: unknown } | null | undefined)?.detail;
      const reason = typeof detail === 'string' ? detail : error.message;
      return `Error ${error.status}: ${reason}`;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Error al iniciar sesión. Intenta nuevamente.';
  }
}
