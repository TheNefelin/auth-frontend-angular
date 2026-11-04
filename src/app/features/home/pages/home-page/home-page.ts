import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { httpResource } from "@angular/common/http";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";
import { AuthStoreService } from "@core/services/auth-store-service";
import { UserDetailsComponent } from "@features/home/components/user-details-component/user-details-component";
import type { UserProfile } from "@core/models/user-profile";

@Component({
  imports: [UserDetailsComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly store = inject(AuthStoreService);

  protected readonly profile = httpResource<UserProfile>(() => {
    const token = this.store.readStoredToken();
    if (!token) return undefined;
    return {
      url: 'http://127.0.0.1:8000/auth/me',
      method: 'GET' as const,
      headers: { Authorization: `Bearer ${token}` },
    };
  });

  protected logout(): void {
    this.store.clearSession();
    this.router.navigate([ROUTES_CONSTANTS.AUTH]);
  }
}
