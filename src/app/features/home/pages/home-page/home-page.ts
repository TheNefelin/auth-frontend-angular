import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";
import { take } from "rxjs";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";
import { AuthStoreService } from "@core/services/auth-store-service";
import { AuthService } from "@features/auth/services/auth-service";
import { UserDetailsComponent } from "@features/home/components/user-details-component/user-details-component";

@Component({
  imports: [UserDetailsComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly authStoreService = inject(AuthStoreService);
  private readonly authService = inject(AuthService);

  protected readonly profile = rxResource({
    stream: () => this.authService.me(),
  });

  protected logout(): void {
    // Revoca la sesión en el servidor (fire-and-forget): no bloquea el cierre
    // local aunque el backend falle o esté caído.
    this.authService.logout().pipe(take(1)).subscribe({ error: () => undefined });

    this.authStoreService.clearSession();
    this.router.navigate([ROUTES_CONSTANTS.AUTH.LOGIN]);
  }}
