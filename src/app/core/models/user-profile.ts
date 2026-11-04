export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  lastname: string | null;
  picture_url: string | null;
  email_verified: boolean;
  is_active: boolean;
  role: string | null;
  status: string | null;
  provider: string | null;
}
