export interface Coursebook {
  id: string; // uuid
  class_subject_id: string; // FK class_subjects.id
  teacher_id: string; // FK teachers.id
  date: Date;
  topic: string;
  content?: string;
  homework?: string;
  created_at: Date;
}

export interface CreateCoursebookInput extends Omit<Coursebook, "id" | "created_at"> {}
export interface UpdateCoursebookInput extends Partial<CreateCoursebookInput> {}