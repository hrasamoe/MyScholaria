export interface OAuthAccount {
  id: string; // uuid
  user_id: string; // FK users.id
  provider: OAuthProvider;
  provider_id: string;
  access_token?: string;
  expires_at?: Date;
  created_at: Date;
}

export enum OAuthProvider {
  GOOGLE = "google",
  GITHUB = "github",
  FACEBOOK = "facebook",
  APPLE = "apple",
}

export interface CreateOAuthAccountInput extends Omit<OAuthAccount, "id" | "created_at"> {}