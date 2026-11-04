import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { AuthStoreService } from '@core/services/auth-store-service';

const API = 'http://127.0.0.1:8000';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let store: AuthStoreService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStoreService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('añade el header Authorization a la API propia', () => {
    store.setSession('access-1', 'refresh-1');
    http.get(`${API}/auth/me`).subscribe();

    const req = httpMock.expectOne(`${API}/auth/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
    req.flush({});
  });

  it('no añade el header a peticiones externas', () => {
    store.setSession('access-1', 'refresh-1');
    http.get('https://otro-sitio.com/data').subscribe();

    const req = httpMock.expectOne('https://otro-sitio.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('en 401 refresca y reintenta con el nuevo token', () => {
    store.setSession('access-viejo', 'refresh-1');
    let responseBody: unknown;

    http.get(`${API}/auth/me`).subscribe((body) => (responseBody = body));

    httpMock.expectOne(`${API}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${API}/auth/refresh`);
    expect(refreshReq.request.body).toEqual({ refresh_token: 'refresh-1' });
    refreshReq.flush({ access_token: 'access-nuevo', refresh_token: 'refresh-2' });

    const retryReq = httpMock.expectOne(`${API}/auth/me`);
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer access-nuevo');
    retryReq.flush({ id: '1' });

    expect(responseBody).toEqual({ id: '1' });
    expect(store.readStoredToken()).toBe('access-nuevo');
    expect(store.readRefreshToken()).toBe('refresh-2');
  });

  it('si el refresh falla, limpia sesión y navega a /', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    store.setSession('access-viejo', 'refresh-1');
    let errored = false;

    http.get(`${API}/auth/me`).subscribe({ error: () => (errored = true) });

    httpMock.expectOne(`${API}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(`${API}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(store.hasSession()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('no intenta refrescar en un 401 de una petición externa', () => {
    store.setSession('access-1', 'refresh-1');
    let errored = false;

    http.get('https://otro-sitio.com/data').subscribe({ error: () => (errored = true) });

    httpMock.expectOne('https://otro-sitio.com/data').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errored).toBe(true);
    expect(store.hasSession()).toBe(true);
    httpMock.expectNone(`${API}/auth/refresh`);
  });
});
