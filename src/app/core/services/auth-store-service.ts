import { Service } from '@angular/core';

const TOKEN_KEY = 'jwt_token';

@Service()
export class AuthStoreService {
  setSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }
}
