import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { authGuard } from './auth-guard';
import { AuthService } from '@features/auth/services/auth-service';
import { AuthStoreService } from '@core/services/auth-store-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('authGuard', () => {
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('sin sesión (401 en /me) redirige a login', async () => {
    const result$ = runGuard() as ReturnType<typeof runGuard> & { subscribe?: unknown };
    const promise = firstValueFrom(result$ as never);
    httpMock.expectOne('/ssr-api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    const result = await promise;
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('con sesión (200 en /me) permite el acceso', async () => {
    const result$ = runGuard() as never;
    const promise = firstValueFrom(result$ as never);
    httpMock.expectOne('/ssr-api/auth/me').flush({ id: '1' });
    const result = await promise;
    expect(result).toBe(true);
  });
});
