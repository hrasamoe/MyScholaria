export interface Student {
  id: string; // uuid
  profile_id: string; // UNIQUE, FK profiles.id
  establishment_id: string; // FK establishments.id
  student_number: string; // UNIQUE
  enrollment_date: Date;
  class_id?: string; // FK classes.id
  status: StudentStatus;
  parent_id?: string; // FK profiles.id
  medical_notes?: string;
  photo_url?: string;
  created_at: Date;
  updated_at: Date;
}

export enum StudentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  GRADUATED = "graduated",
  TRANSFERRED = "transferred",
}

export interface CreateStudentInput extends Omit<Student, "id" | "created_at" | "updated_at"> {}
export interface UpdateStudentInput extends Partial<CreateStudentInput> {}