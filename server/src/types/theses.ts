import { ProgramCycle } from "./programs";

export interface Thesis {
  id: string; // uuid
  student_id: string; // FK students.id
  title: string;
  cycle: ProgramCycle;
  supervisor_id?: string; // FK teachers.id
  co_supervisor_id?: string; // FK teachers.id
  start_date: Date;
  defense_date?: Date;
  status: ThesisStatus;
  final_grade?: number;
  pdf_url?: string;
  created_at: Date;
}

export enum ThesisStatus {
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  DEFENDED = "defended",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface CreateThesisInput extends Omit<Thesis, "id" | "created_at"> {}
export interface UpdateThesisInput extends Partial<CreateThesisInput> {}