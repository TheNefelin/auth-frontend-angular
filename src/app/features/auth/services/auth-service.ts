import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api-service';
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
}
