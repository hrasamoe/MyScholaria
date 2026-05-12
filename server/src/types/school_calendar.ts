export interface SchoolCalendar {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  event_type: string;
  title: string;
  start_date: Date;
  end_date: Date;
  description?: string;
  created_at: Date;
}

export interface CreateSchoolCalendarInput extends Omit<SchoolCalendar, "id" | "created_at"> {}
export interface UpdateSchoolCalendarInput extends Partial<CreateSchoolCalendarInput> {}