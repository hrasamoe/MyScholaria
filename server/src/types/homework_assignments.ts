export interface HomeworkAssignment {
  id: string; // uuid
  class_subject_id: string; // FK class_subjects.id
  title: string;
  description?: string;
  due_date: Date;
  attachments: any[]; // jsonb
  created_at: Date;
}

export interface CreateHomeworkAssignmentInput extends Omit<HomeworkAssignment, "id" | "created_at"> {}
export interface UpdateHomeworkAssignmentInput extends Partial<CreateHomeworkAssignmentInput> {}