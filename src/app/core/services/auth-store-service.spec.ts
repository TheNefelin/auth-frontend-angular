import { TestBed } from '@angular/core/testing';
import { AuthStoreService } from './auth-store-service';

describe('AuthStoreService', () => {
  let service: AuthStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStoreService);
  });

  afterEach(() => localStorage.clear());

  it('arranca sin sesión si el storage está vacío', () => {
    expect(service.hasSession()).toBe(false);
    expect(service.readStoredToken()).toBeNull();
    expect(service.readRefreshToken()).toBeNull();
  });

  it('setSession guarda access y refresh', () => {
    service.setSession('access-1', 'refresh-1');

    expect(service.hasSession()).toBe(true);
    expect(service.readStoredToken()).toBe('access-1');
    expect(service.readRefreshToken()).toBe('refresh-1');
    expect(localStorage.getItem('jwt_token')).toBe('access-1');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-1');
  });

  it('hasSession es true con solo access', () => {
    service.setSession('solo-access');
    expect(service.hasSession()).toBe(true);
  });

  it('clearSession limpia ambos tokens', () => {
    service.setSession('access-1', 'refresh-1');
    service.clearSession();

    expect(service.hasSession()).toBe(false);
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('updateAccessToken reemplaza solo el access', () => {
    service.setSession('access-1', 'refresh-1');
    service.updateAccessToken('access-2');

    expect(service.readStoredToken()).toBe('access-2');
    expect(service.readRefreshToken()).toBe('refresh-1');
  });

  it('inicializa desde el storage existente', () => {
    localStorage.setItem('jwt_token', 'persistido');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newService = TestBed.inject(AuthStoreService);

    expect(newService.readStoredToken()).toBe('persistido');
    expect(newService.hasSession()).toBe(true);
  });
});
