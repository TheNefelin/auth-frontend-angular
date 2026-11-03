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
  googleToken: string
}

export interface ApiAuthGoogleResponse {
  token: string,
  user: AuthUser
}

export interface AuthUser {
  id_user: string,
  email: string,
  name?: string,
  picture?: string,
  profileComplete: boolean,
  role: Role,
}

export enum Role {
  Admin = 'Admin',
  Reader = 'Lector'
}
