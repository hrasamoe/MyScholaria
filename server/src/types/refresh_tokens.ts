export interface RefreshToken {
  id: string; // uuid
  user_id: string; // FK users.id
  token_hash: string; // UNIQUE
  device_info?: string;
  ip_address?: string;
  expires_at: Date;
  revoked_at?: Date;
  created_at: Date;
}

export interface CreateRefreshTokenInput extends Omit<RefreshToken, "id" | "created_at"> {}