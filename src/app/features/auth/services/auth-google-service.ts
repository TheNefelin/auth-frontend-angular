import { inject, Service, signal } from '@angular/core';
import { LoggerService } from '@core/services/logger-service';
import { environment } from '@environments/environment';
import { GoogleAccounts } from '@features/auth/models/models';

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getGoogle = (): { accounts?: GoogleAccounts } | undefined => {
  if (!isBrowser()) return undefined;
  return (window as unknown as { google?: { accounts?: GoogleAccounts } }).google;
};

@Service()
export class AuthGoogleService {
    // ✅ Señal interna opcional para saber si el script está listo
  private scriptReady = signal(false);
  private readonly logger = inject(LoggerService);

  constructor() {
    // 🔹 Espera a que window.google esté disponible (solo en navegador)
    if (isBrowser()) {
      this.checkGoogleScript();
    }
  }

  // 🔹 Espera a que window.google esté disponible
  private checkGoogleScript(): void {
    const google = getGoogle();

    if (google?.accounts?.oauth2) {
      this.scriptReady.set(true);
      return;
    }

    // Poll cada 100ms hasta 10 segundos
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const google = getGoogle();
      if (google?.accounts?.oauth2) {
        clearInterval(interval);
        this.scriptReady.set(true);
      } else if (attempts >= 100) {
        clearInterval(interval);
        this.logger.error(
          'AuthGoogleService',
          'Google Identity Services no se cargó después de 10 segundos. Revisa que el script esté en index.html'
        );
      }
    }, 100);
  }

   // 🔹 Método público para obtener access_token via popup
   async getAccessToken(): Promise<string> {
    if (!isBrowser()) {
      throw new Error('Google OAuth2 solo está disponible en el navegador');
    }

    // ✅ Esperar hasta que el script esté listo
    await this.waitForScript();

    return new Promise((resolve, reject) => {
      const oauth2 = getGoogle()?.accounts?.oauth2;
      if (!oauth2?.initTokenClient) {
        reject(new Error('Google OAuth2 no disponible'));
        return;
      }

      const client = oauth2.initTokenClient({
        client_id: environment.googleClientId,
        scope: 'email profile',
        callback: (response) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(response.error || 'No se recibió access_token'));
          }
        },
        error_callback: (error) => {
          reject(error);
        },
      });

      // ✅ Abrir popup
      client.requestAccessToken();
    });
  }

  // 🔹 Espera interna hasta que scriptReady sea true (timeout de 10s)
  private waitForScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const check = () => {
        if (this.scriptReady()) {
          resolve();
        } else if (Date.now() - started >= 10_000) {
          reject(new Error('Google Identity Services no se cargó después de 10 segundos. Revisa que el script esté en index.html'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}