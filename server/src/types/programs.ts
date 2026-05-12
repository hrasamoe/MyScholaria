export interface Program {
  id: string; // uuid
  code: string; // UNIQUE
  name: string;
  cycle: ProgramCycle;
  duration_years: number;
  total_ects?: number;
  head_id?: string; // FK profiles.id
  created_at: Date;
}

export enum ProgramCycle {
  LICENSE = "license",
  MASTER = "master",
  DOCTORATE = "doctorate",
}

export interface CreateProgramInput extends Omit<Program, "id" | "created_at"> {}
export interface UpdateProgramInput extends Partial<CreateProgramInput> {}