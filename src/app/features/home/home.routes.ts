import { Routes } from "@angular/router";
import { HomePage } from "@features/home/pages/home-page/home-page";
import { authGuard } from "@core/guards/auth-guard";

export const ROUTES: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [authGuard],
  }
]
