import { inject, Service } from '@angular/core';
import { LoggerService } from '@core/services/logger-service';
import { environment } from '@environments/environment';
import { GoogleAccounts } from '@features/auth/models/models';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GIS_LOAD_TIMEOUT_MS = 10000;

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const getGoogle = (): { accounts?: GoogleAccounts } | undefined => {
  if (!isBrowser()) return undefined;
  return (window as unknown as { google?: { accounts?: GoogleAccounts } }).google;
};

@Service()
export class AuthGoogleService {
  private readonly logger = inject(LoggerService);
  private scriptPromise: Promise<void> | null = null;

  // 🔹 Obtiene un access_token vía popup, cargando GIS bajo demanda si hace falta
  async getAccessToken(): Promise<string> {
    await this.ensureGisLoaded();

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

  // 🔹 Carga GIS una sola vez (idempotente) y rechaza ante error/timeout
  private ensureGisLoaded(): Promise<void> {
    if (!isBrowser()) {
      return Promise.reject(new Error('Google OAuth2 solo está disponible en el navegador'));
    }

    this.scriptPromise ??= this.withTimeout(this.loadGisScript(), GIS_LOAD_TIMEOUT_MS)
      .catch((error: unknown) => {
        // Permite reintento en la próxima llamada tras un fallo transitorio
        this.scriptPromise = null;
        this.logger.error('AuthGoogleService', 'No se pudo cargar Google Identity Services', error);
        throw error;
      });

    return this.scriptPromise;
  }

  private loadGisScript(): Promise<void> {
    // Si ya está cargado (por una ejecución anterior), resuelve al instante
    if (getGoogle()?.accounts?.oauth2) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (getGoogle()?.accounts?.oauth2) {
          resolve();
        } else {
          script.remove();
          reject(new Error('GIS se cargó pero no inicializó window.google'));
        }
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('No se pudo cargar Google Identity Services (red o CSP)'));
      };

      document.head.appendChild(script);
    });
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Google Identity Services no se cargó después de 10 segundos. Revisa red/CSP')),
        ms,
      );
      promise.then(
        (value) => { clearTimeout(timer); resolve(value); },
        (error) => { clearTimeout(timer); reject(error); },
      );
    });
  }
}
