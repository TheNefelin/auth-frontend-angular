import { Routes } from "@angular/router";
import { AuthPage } from "@features/auth/pages/auth-page/auth-page";
import { RegisterPage } from "@features/auth/pages/register-page/register-page";

export const ROUTES: Routes = [
  {
    path: '',
    component: AuthPage,
  },
  {
    path: 'register',
    component: RegisterPage,
  }
]
