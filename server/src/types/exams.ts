export interface Exam {
  id: string; // uuid
  class_subject_id: string; // FK class_subjects.id
  title: string;
  type: ExamType;
  date: Date;
  duration_minutes?: number;
  room_id?: string; // FK rooms.id
  coefficient: number;
  max_score: number;
  created_at: Date;
}

export enum ExamType {
  TEST = "test",
  MIDTERM = "midterm",
  FINAL = "final",
  QUIZ = "quiz",
  PRACTICAL = "practical",
}

export interface CreateExamInput extends Omit<Exam, "id" | "created_at"> {}
export interface UpdateExamInput extends Partial<CreateExamInput> {}