import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api-service';
import { environment } from '@environments/environment';
import {
  ApiAuthGoogleRequest,
  ApiAuthLoginRequest,
  ApiAuthRegisterRequest,
  RegisterForm,
} from '@features/auth/models/models';
import type { UserProfile } from '@core/models/user-profile';

@Service()
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'auth';

  loginGoogle(item: ApiAuthGoogleRequest): Observable<void> {
    return this.apiService
      .create<unknown, ApiAuthGoogleRequest>(`${this.endpoint}/google`, item)
      .pipe(map(() => void 0));
  }

  me(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>(`${this.endpoint}/me`);
  }

  login(item: ApiAuthLoginRequest): Observable<void> {
    return this.apiService
      .create<unknown, ApiAuthLoginRequest>(`${this.endpoint}/login`, item)
      .pipe(map(() => void 0));
  }

  register(item: RegisterForm): Observable<void> {
    const payload: ApiAuthRegisterRequest = { email: item.email, password: item.password };
    return this.apiService
      .create<unknown, ApiAuthRegisterRequest>(`${this.endpoint}/register`, payload)
      .pipe(map(() => void 0));
  }

  logout(): Observable<{ status: string }> {
    return this.apiService.post<{ status: string }>(`${this.endpoint}/logout`);
  }
}
