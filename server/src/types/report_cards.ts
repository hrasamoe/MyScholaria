export interface ReportCard {
  id: string; // uuid
  student_id: string; // FK students.id
  period: ReportCardPeriod;
  academic_year: string;
  average?: number;
  rank?: number;
  decision?: string;
  pdf_url?: string;
  published_at?: Date;
  created_at: Date;
}

export enum ReportCardPeriod {
  FIRST_TERM = "first_term",
  SECOND_TERM = "second_term",
  THIRD_TERM = "third_term",
  ANNUAL = "annual",
}

export interface CreateReportCardInput extends Omit<ReportCard, "id" | "created_at"> {}
export interface UpdateReportCardInput extends Partial<CreateReportCardInput> {}