export interface ClassSubject {
  id: string; // uuid
  class_id: string; // FK classes.id
  subject_id: string; // FK subjects.id
  teacher_id?: string; // FK teachers.id
  weekly_hours?: number;
  created_at: Date;
}

export interface CreateClassSubjectInput extends Omit<ClassSubject, "id" | "created_at"> {}
export interface UpdateClassSubjectInput extends Partial<CreateClassSubjectInput> {}