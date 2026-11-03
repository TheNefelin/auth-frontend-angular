import { Component, inject, signal } from "@angular/core";
import { AuthGoogleComponent } from "@features/auth/components/auth-google-component/auth-google-component";
import { AuthGithubComponent } from "@features/auth/components/auth-github-component/auth-github-component";
import { AuthAppleComponent } from "@features/auth/components/auth-apple-component/auth-apple-component";
import { AuthLoginComponent } from "@features/auth/components/auth-login-component/auth-login-component";
import { AuthStore } from "@features/auth/services/auth-store";

@Component({
  imports: [AuthGoogleComponent, AuthGithubComponent, AuthAppleComponent, AuthLoginComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {
  protected readonly store = inject(AuthStore);

  protected readonly loadingAuth = signal<boolean>(false);
  protected readonly loadingApple = signal<boolean>(false);
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
    await this.store.login();
  }

  protected async loginGitHub(): Promise<void> {
    this.loadingGitHub.set(true);
    this.disabled.set(true);
  }
}
