import { Service, computed, signal } from '@angular/core';

const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';

@Service()
export class AuthStoreService {
  private readonly tokenSignal = signal<string | null>(this.readFromStorage(TOKEN_KEY));
  private readonly refreshSignal = signal<string | null>(this.readFromStorage(REFRESH_KEY));

  readonly token = this.tokenSignal.asReadonly();
  readonly hasSession = computed(() => !!this.tokenSignal() || !!this.refreshSignal());

  setSession(accessToken: string, refreshToken?: string): void {
    this.writeToStorage(TOKEN_KEY, accessToken);
    this.tokenSignal.set(accessToken);

    if (refreshToken) {
      this.writeToStorage(REFRESH_KEY, refreshToken);
      this.refreshSignal.set(refreshToken);
    }
  }

  clearSession(): void {
    this.removeFromStorage(TOKEN_KEY);
    this.removeFromStorage(REFRESH_KEY);
    this.tokenSignal.set(null);
    this.refreshSignal.set(null);
  }

  readStoredToken(): string | null {
    return this.tokenSignal();
  }

  readRefreshToken(): string | null {
    return this.refreshSignal();
  }

  updateAccessToken(accessToken: string): void {
    this.writeToStorage(TOKEN_KEY, accessToken);
    this.tokenSignal.set(accessToken);
  }

  private readFromStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }

  private writeToStorage(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  }

  private removeFromStorage(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  }
}
