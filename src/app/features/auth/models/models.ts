// --- SDK de Google Identity Services (GIS) ---

/** Respuesta del script GIS (no es del backend). */
export interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

export interface TokenClient {
  requestAccessToken(): void;
}

export interface OAuth2Client {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback: (error: unknown) => void;
  }): TokenClient;
}

export interface GoogleAccounts {
  oauth2?: OAuth2Client;
}

// --- API del backend (contrato HTTP) ---

export interface ApiAuthGoogleRequest {
  googleToken: string;
}

export interface ApiAuthLoginRequest {
  email: string;
  password: string;
}

/** Registro hacia el backend (sin confirmPassword: solo validación local). */
export interface ApiAuthRegisterRequest {
  email: string;
  password: string;
}

/** Respuesta de token común a login, register, google y refresh. */
export interface ApiAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// --- Formularios (UI) ---

export interface LoginForm {
  email: string;
  password: string;
}

/** Datos del formulario de registro (incluye confirmPassword, solo para validar). */
export interface RegisterForm extends LoginForm {
  confirmPassword: string;
}
