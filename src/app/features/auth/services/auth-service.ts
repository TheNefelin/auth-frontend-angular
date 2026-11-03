import { inject, Service } from '@angular/core';
import { ApiService } from '@core/services/api-service';
import { Observable } from 'rxjs';
import { ApiAuthGoogleRequest, ApiAuthGoogleResponse } from '@features/auth/models/models'; 

@Service()
export class AuthService {
  private apiService = inject(ApiService)
  private readonly endpoint = 'auth/google';

  auth(item: ApiAuthGoogleRequest): Observable<ApiAuthGoogleResponse> {
    return this.apiService.create<ApiAuthGoogleResponse, ApiAuthGoogleRequest>(
      this.endpoint, item
    );
  }
}
