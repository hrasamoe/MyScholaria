export interface Scholarship {
  id: string; // uuid
  student_id: string; // FK students.id
  type: ScholarshipType;
  amount: number;
  academic_year: string;
  status: ScholarshipStatus;
  decision_date?: Date;
  created_at: Date;
}

export enum ScholarshipType {
  MERIT = "merit",
  NEED_BASED = "need_based",
  SPORTS = "sports",
  PARTIAL = "partial",
  FULL = "full",
}

export enum ScholarshipStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export interface CreateScholarshipInput extends Omit<Scholarship, "id" | "created_at"> {}
export interface UpdateScholarshipInput extends Partial<CreateScholarshipInput> {}