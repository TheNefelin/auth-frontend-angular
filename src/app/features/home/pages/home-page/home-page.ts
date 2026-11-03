import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ROUTES_CONSTANTS } from "@shared/constants/routes-constant";

@Component({
  imports: [],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly router = inject(Router);

  protected logout(): void {
    this.router.navigate([ROUTES_CONSTANTS.AUTH]);
  }
}