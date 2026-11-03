import { computed, Service, signal } from '@angular/core';

const TOKEN_KEY = 'jwt_token';

@Service()
export class AuthStore {
  private readonly tokenSignal = signal<string | null>(this.readStoredToken());

  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  setSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    // Limpia la clave legacy de builds anteriores que guardaban el usuario.
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
  }

  private readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }
}
