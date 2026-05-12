export interface Establishment {
  id: string; // uuid
  name: string;
  code: string; // UNIQUE
  type: EstablishmentType; // enum: school, university, college
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  city: string;
  zip_code?: number;
  identification_number?: string; // UNIQUE
  join_code?: string; // UNIQUE
  join_code_hash?: string;
  admin_code?: string; // UNIQUE
  admin_code_hash?: string;
  is_active: boolean;
  owner_id?: string; // FK users.id
  created_at: Date;
  updated_at: Date;
}

export enum EstablishmentType {
  SCHOOL = "school",
  UNIVERSITY = "university",
  COLLEGE = "college",
  OTHER = "other",
}

export interface CreateEstablishmentInput extends Omit<Establishment, "id" | "created_at" | "updated_at"> {}
export interface UpdateEstablishmentInput extends Partial<CreateEstablishmentInput> {}