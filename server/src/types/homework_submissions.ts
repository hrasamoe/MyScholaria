export interface HomeworkSubmission {
  id: string; // uuid
  assignment_id: string; // FK homework_assignments.id
  student_id: string; // FK students.id
  submitted_at: Date;
  file_url?: string;
  grade?: number; // 0-20
  feedback?: string;
}

export interface CreateHomeworkSubmissionInput extends Omit<HomeworkSubmission, "id" | "submitted_at"> {}
export interface UpdateHomeworkSubmissionInput extends Partial<CreateHomeworkSubmissionInput> {}