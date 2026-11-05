export interface AuthTokenResponse {
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
    callback: (response: AuthTokenResponse) => void;
    error_callback: (error: unknown) => void;
  }): TokenClient;
}

export interface GoogleAccounts {
  oauth2?: OAuth2Client;
}

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

/** Respuesta de token común a login/register/google. */
export interface ApiAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Modelos del contrato de usuario del backend (se usarán al integrar /auth/me).
export interface AuthUser {
  id_user: string;
  email: string;
  name?: string;
  picture?: string;
  profileComplete: boolean;
  role: Role;
}

export enum Role {
  Admin = 'Admin',
  Reader = 'Lector',
}

export interface LoginForm {
  email: string;
  password: string;
}

/** Datos del formulario de registro (incluye confirmPassword, solo para validar). */
export interface RegisterForm extends LoginForm {
  confirmPassword: string;
}
