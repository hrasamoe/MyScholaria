export interface StaffAbsence {
  id: string; // uuid
  user_id: string; // FK profiles.id
  start_date: Date;
  end_date: Date;
  reason?: string;
  type?: StaffAbsenceType;
  approved_by?: string; // FK profiles.id
  created_at: Date;
}

export enum StaffAbsenceType {
  SICK_LEAVE = "sick_leave",
  ANNUAL_LEAVE = "annual_leave",
  UNPAID = "unpaid",
  OTHER = "other",
}

export interface CreateStaffAbsenceInput extends Omit<StaffAbsence, "id" | "created_at"> {}
export interface UpdateStaffAbsenceInput extends Partial<CreateStaffAbsenceInput> {}