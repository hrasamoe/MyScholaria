export interface ReportCardLine {
  id: string; // uuid
  report_card_id: string; // FK report_cards.id
  subject_id: string; // FK subjects.id
  average?: number;
  class_average?: number;
  coefficient: number;
  teacher_comment?: string;
}

export interface CreateReportCardLineInput extends Omit<ReportCardLine, "id"> {}
export interface UpdateReportCardLineInput extends Partial<CreateReportCardLineInput> {}