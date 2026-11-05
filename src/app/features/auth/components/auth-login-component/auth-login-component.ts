import { Component, inject, input, output } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingComponent } from "@shared/components/loading-component/loading-component";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";

@Component({
  imports: [LoadingComponent],
  selector: 'app-auth-login-component',
  templateUrl: './auth-login-component.html',
})
export class AuthLoginComponent {
  private readonly router = inject(Router);

  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly login = output<void>();

  protected navigateToRegister(): void {
    this.router.navigate([ROUTES_CONSTANTS.AUTH.REGISTER]);    
  }
}
