import { inject, Service } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api-service';
import { SKIP_AUTH_INTERCEPTOR } from '@core/interceptors/auth-context';
import {
  ApiAuthGoogleRequest,
  ApiAuthLoginRequest,
  ApiAuthRegisterRequest,
  ApiAuthTokenResponse,
  RegisterForm,
} from '@features/auth/models/models';

@Service()
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'auth';

  loginGoogle(item: ApiAuthGoogleRequest): Observable<ApiAuthTokenResponse> {
    return this.apiService.create<ApiAuthTokenResponse, ApiAuthGoogleRequest>(
      `${this.endpoint}/google`, item,
    );
  }

  login(item: ApiAuthLoginRequest): Observable<ApiAuthTokenResponse> {
    return this.apiService.create<ApiAuthTokenResponse, ApiAuthLoginRequest>(
      `${this.endpoint}/login`, item,
    );
  }

  register(item: RegisterForm): Observable<ApiAuthTokenResponse> {
    const payload: ApiAuthRegisterRequest = { email: item.email, password: item.password };
    return this.apiService.create<ApiAuthTokenResponse, ApiAuthRegisterRequest>(
      `${this.endpoint}/register`, payload,
    );
  }

  logout(): Observable<{ status: string }> {
    return this.apiService.post<{ status: string }>(`${this.endpoint}/logout`);
  }

  /** Renueva la sesión. Marcada para NO re-entrar al authInterceptor (evita ciclo). */
  refresh(refreshToken: string): Observable<ApiAuthTokenResponse> {
    return this.http.post<ApiAuthTokenResponse>(
      `http://127.0.0.1:8000/${this.endpoint}/refresh`,
      { refresh_token: refreshToken },
      { context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true) },
    );
  }
}
