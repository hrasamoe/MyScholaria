export interface DisciplinaryAction {
  id: string; // uuid
  student_id: string; // FK students.id
  type: DisciplinaryActionType;
  reason: string;
  date: Date;
  decided_by?: string; // FK profiles.id
  description?: string;
  created_at: Date;
}

export enum DisciplinaryActionType {
  WARNING = "warning",
  SUSPENSION = "suspension",
  EXPULSION = "expulsion",
  OTHER = "other",
}

export interface CreateDisciplinaryActionInput extends Omit<DisciplinaryAction, "id" | "created_at"> {}
export interface UpdateDisciplinaryActionInput extends Partial<CreateDisciplinaryActionInput> {}