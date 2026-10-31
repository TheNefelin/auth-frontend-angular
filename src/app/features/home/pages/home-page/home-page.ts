import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  imports: [],
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly router = inject(Router);

  protected logout(): void {
    this.router.navigate(["/"]);
  }
}