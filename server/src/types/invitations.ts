export interface Invitation {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  email?: string;
  token: string; // UNIQUE
  role: string;
  expires_at: Date;
  used_at?: Date;
  created_by?: string; // FK users.id
  created_at: Date;
}

export interface CreateInvitationInput extends Omit<Invitation, "id" | "created_at"> {}
export interface UpdateInvitationInput extends Partial<CreateInvitationInput> {}