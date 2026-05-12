export interface EstablishmentMember {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  user_id: string; // FK users.id
  role_name: string;
  joined_at: Date;
  is_active: boolean;
}

export interface CreateEstablishmentMemberInput extends Omit<EstablishmentMember, "id"> {}
export interface UpdateEstablishmentMemberInput extends Partial<CreateEstablishmentMemberInput> {}