export interface Diploma {
  id: string; // uuid
  student_id: string; // FK students.id
  program_id: string; // FK programs.id
  serial_number: string; // UNIQUE
  issue_date: Date;
  mention?: string;
  pdf_url?: string;
  signed_by?: string; // FK profiles.id
  created_at: Date;
}

export interface CreateDiplomaInput extends Omit<Diploma, "id" | "created_at"> {}
export interface UpdateDiplomaInput extends Partial<CreateDiplomaInput> {}