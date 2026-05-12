export interface FeeStructure {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  name: string;
  level?: string;
  academic_year: string;
  amount: number;
  frequency: FeeFrequency;
  created_at: Date;
}

export enum FeeFrequency {
  ANNUAL = "annual",
  SEMESTER = "semester",
  TRIMESTER = "trimester",
  MONTHLY = "monthly",
}

export interface CreateFeeStructureInput extends Omit<FeeStructure, "id" | "created_at"> {}
export interface UpdateFeeStructureInput extends Partial<CreateFeeStructureInput> {}