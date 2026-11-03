import { Component, inject, signal } from "@angular/core";
import { AuthGoogleComponent } from "@features/auth/components/auth-google-component/auth-google-component";
import { AuthGithubComponent } from "@features/auth/components/auth-github-component/auth-github-component";
import { AuthAppleComponent } from "@features/auth/components/auth-apple-component/auth-apple-component";
import { AuthLoginComponent } from "@features/auth/components/auth-login-component/auth-login-component";
import { AuthGoogleService } from "@features/auth/services/auth-google-service";
import { Router } from "@angular/router";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";

@Component({
  imports: [AuthGoogleComponent, AuthGithubComponent, AuthAppleComponent, AuthLoginComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {
  private readonly router = inject(Router);
  private readonly authGoogle = inject(AuthGoogleService);
  
  protected readonly loadingAuth = signal<boolean>(false);
  protected readonly loadingApple = signal<boolean>(false);
  protected readonly loadingGoogle = signal<boolean>(false);
  protected readonly loadingGitHub = signal<boolean>(false);
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
      const idToken = await this.authGoogle.getAccessToken();
      // Aquí puedes enviar el token al backend si es necesario
      console.log('Google ID Token obtenido:', idToken);
      // Redirigir o navegar tras login exitoso
      this.router.navigate([ROUTES_CONSTANTS.HOME]);
    } catch (error) {
      console.error('Error en login con Google:', error);
      // Mostrar mensaje de error al usuario
    } finally {
      this.loadingGoogle.set(false);
      this.disabled.set(false);
    }
  }

  protected async loginGitHub(): Promise<void> {
    this.loadingGitHub.set(true);
    this.disabled.set(true);
  }
}