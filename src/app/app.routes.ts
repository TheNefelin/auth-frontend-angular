import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.ROUTES), 
  },
  {
    path: 'home',
    loadChildren: () => import('@features/home/home.routes').then(m => m.ROUTES),
  }
];

