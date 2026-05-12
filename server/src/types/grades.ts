export interface Grade {
  id: string; // uuid
  student_id: string; // FK students.id
  exam_id: string; // FK exams.id
  score: number; // 0-20
  comment?: string;
  graded_by?: string; // FK profiles.id
  graded_at: Date;
}

export interface CreateGradeInput extends Omit<Grade, "id"> {}
export interface UpdateGradeInput extends Partial<CreateGradeInput> {}