export interface Profile {
  id: string; // uuid, FK users.id
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  gender?: Gender;
  nationality?: string;
  created_at: Date;
  updated_at: Date;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export interface CreateProfileInput extends Omit<Profile, "id" | "created_at" | "updated_at"> {}
export interface UpdateProfileInput extends Partial<CreateProfileInput> {}