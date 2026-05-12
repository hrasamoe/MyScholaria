export interface Internship {
  id: string; // uuid
  student_id: string; // FK students.id
  company_name: string;
  tutor_name?: string;
  start_date: Date;
  end_date: Date;
  topic?: string;
  mentor_teacher_id?: string; // FK teachers.id
  status: InternshipStatus;
  final_grade?: number;
  created_at: Date;
}

export enum InternshipStatus {
  PENDING = "pending",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface CreateInternshipInput extends Omit<Internship, "id" | "created_at"> {}
export interface UpdateInternshipInput extends Partial<CreateInternshipInput> {}