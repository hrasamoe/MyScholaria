export interface Subject {
  id: string; // uuid
  code: string; // UNIQUE
  name: string;
  level?: string;
  coefficient: number;
  hours_per_week?: number;
  description?: string;
  created_at: Date;
}

export interface CreateSubjectInput extends Omit<Subject, "id" | "created_at"> {}
export interface UpdateSubjectInput extends Partial<CreateSubjectInput> {}