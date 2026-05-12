export interface Attendance {
  id: string; // uuid
  student_id: string; // FK students.id
  class_subject_id: string; // FK class_subjects.id
  date: Date;
  status: AttendanceStatus;
  recorded_by?: string; // FK profiles.id
  comment?: string;
  created_at: Date;
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
  JUSTIFIED = "justified",
}

export interface CreateAttendanceInput extends Omit<Attendance, "id" | "created_at"> {}
export interface UpdateAttendanceInput extends Partial<CreateAttendanceInput> {}