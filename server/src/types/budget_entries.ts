export interface BudgetEntry {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  type: BudgetEntryType;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  created_by?: string; // FK profiles.id
  created_at: Date;
}

export enum BudgetEntryType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface CreateBudgetEntryInput extends Omit<BudgetEntry, "id" | "created_at"> {}
export interface UpdateBudgetEntryInput extends Partial<CreateBudgetEntryInput> {}