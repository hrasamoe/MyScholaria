export interface SchoolPeriod {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  name: string;
  start_date: Date;
  end_date: Date;
  academic_year: string;
  is_current: boolean;
  created_at: Date;
}

export interface CreateSchoolPeriodInput extends Omit<SchoolPeriod, "id" | "created_at"> {}
export interface UpdateSchoolPeriodInput extends Partial<CreateSchoolPeriodInput> {}