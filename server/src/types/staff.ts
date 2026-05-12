import { ContractType } from "./teachers";

export interface Staff {
  id: string; // uuid
  profile_id: string; // UNIQUE, FK profiles.id
  establishment_id: string; // FK establishments.id
  position?: string;
  department?: string;
  hire_date?: Date;
  contract_type?: ContractType;
  salary?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStaffInput extends Omit<Staff, "id" | "created_at" | "updated_at"> {}
export interface UpdateStaffInput extends Partial<CreateStaffInput> {}