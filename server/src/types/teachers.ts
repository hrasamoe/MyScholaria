export interface Teacher {
  id: string; // uuid
  profile_id: string; // UNIQUE, FK profiles.id
  establishment_id: string; // FK establishments.id
  employee_number: string; // UNIQUE
  specialization?: string;
  hire_date?: Date;
  contract_type?: ContractType;
  hourly_rate?: number;
  created_at: Date;
  updated_at: Date;
}

export enum ContractType {
  PERMANENT = "permanent",
  CONTRACT = "contract",
  TEMPORARY = "temporary",
  PART_TIME = "part_time",
}

export interface CreateTeacherInput extends Omit<Teacher, "id" | "created_at" | "updated_at"> {}
export interface UpdateTeacherInput extends Partial<CreateTeacherInput> {}