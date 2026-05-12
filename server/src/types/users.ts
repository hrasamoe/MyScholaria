export interface User {
  id: string; // uuid
  email: string; // UNIQUE
  password_hash?: string;
  google_id?: string; // UNIQUE
  github_id?: string; // UNIQUE
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  failed_attempts: number;
  locked_until?: Date;
  verify_token?: string;
  verify_expires?: Date;
  reset_token?: string;
  reset_expires?: Date;
  last_login_at?: Date;
  terms_accepted?: boolean;
  privacy_policy_accepted?: boolean;
  consent_date?: Date;
  marketing_consent?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput extends Omit<User, "id" | "created_at" | "updated_at"> {}
export interface UpdateUserInput extends Partial<CreateUserInput> {}