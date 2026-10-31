import { Component, signal } from "@angular/core";
import { AuthGoogleComponent } from "../../components/auth-google-component/auth-google-component";
import { AuthGithubComponent } from "../../components/auth-github-component/auth-github-component";
import { AuthAppleComponent } from "../../components/auth-apple-component/auth-apple-component";
import { AuthLoginComponent } from "../../components/auth-login-component/auth-login-component";

@Component({
  imports: [AuthGoogleComponent, AuthGithubComponent, AuthAppleComponent, AuthLoginComponent],
  selector: 'app-auth-page',
  templateUrl: './auth-page.html',
})
export class AuthPage {
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
  }

  protected async loginGitHub(): Promise<void> {
    this.loadingGitHub.set(true);
    this.disabled.set(true);
  }
}