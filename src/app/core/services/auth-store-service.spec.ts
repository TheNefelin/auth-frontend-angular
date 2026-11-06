import { TestBed } from '@angular/core/testing';
import { AuthStoreService } from './auth-store-service';

describe('AuthStoreService', () => {
  let service: AuthStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStoreService);
  });

  it('arranca sin sesión', () => {
    expect(service.hasSession()).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('setSession marca la sesión activa', () => {
    service.setSession();
    expect(service.hasSession()).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clearSession limpia la sesión', () => {
    service.setSession();
    service.clearSession();
    expect(service.hasSession()).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });
});
