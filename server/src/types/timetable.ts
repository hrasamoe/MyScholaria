export interface Timetable {
  id: string; // uuid
  class_id: string; // FK classes.id
  subject_id: string; // FK subjects.id
  teacher_id?: string; // FK teachers.id
  room_id?: string; // FK rooms.id
  day_of_week: number; // 0-6 (Monday-Sunday)
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  week_type: WeekType;
  created_at: Date;
}

export enum WeekType {
  ALL = "all",
  WEEK_A = "week_a",
  WEEK_B = "week_b",
}

export interface CreateTimetableInput extends Omit<Timetable, "id" | "created_at"> {}
export interface UpdateTimetableInput extends Partial<CreateTimetableInput> {}