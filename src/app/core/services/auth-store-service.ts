import { Service, computed, signal } from '@angular/core';

/**
 * Estado de sesión del cliente (Fase 2: HttpOnly).
 *
 * El cliente NO guarda ni lee tokens: viven en cookies HttpOnly que solo el BFF
 * puede usar. Aquí solo se guarda el *hecho* de tener sesión, para que la UI
 * reaccione. La fuente de verdad real es el servidor (`/auth/me`).
 */
@Service()
export class AuthStoreService {
  private readonly hasSessionSignal = signal<boolean>(false);

  readonly hasSession = this.hasSessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.hasSessionSignal());

  setSession(): void {
    this.hasSessionSignal.set(true);
  }

  clearSession(): void {
    this.hasSessionSignal.set(false);
  }
}
