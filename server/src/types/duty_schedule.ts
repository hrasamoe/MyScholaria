export interface DutySchedule {
  id: string; // uuid
  staff_id: string; // FK staff.id
  date: Date;
  time_slot: string;
  location?: string;
  notes?: string;
  created_at: Date;
}

export interface CreateDutyScheduleInput extends Omit<DutySchedule, "id" | "created_at"> {}
export interface UpdateDutyScheduleInput extends Partial<CreateDutyScheduleInput> {}