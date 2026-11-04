import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthStoreService } from '@core/services/auth-store-service';

describe('authGuard', () => {
  let store: AuthStoreService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(AuthStoreService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('sin sesión redirige a / (login)', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe(router.createUrlTree(['/']).toString());
  });

  it('con sesión permite el acceso', () => {
    store.setSession('access', 'refresh');
    expect(runGuard()).toBe(true);
  });

  it('con solo refresh permite el acceso', () => {
    store.setSession('', 'refresh');
    expect(runGuard()).toBe(true);
  });
});
