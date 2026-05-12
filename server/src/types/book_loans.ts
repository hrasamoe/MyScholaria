export interface BookLoan {
  id: string; // uuid
  book_id: string; // FK books.id
  borrower_id: string; // FK profiles.id
  loan_date: Date;
  due_date: Date;
  return_date?: Date;
  status: LoanStatus;
  fine_amount: number;
  created_at: Date;
}

export enum LoanStatus {
  ACTIVE = "active",
  RETURNED = "returned",
  OVERDUE = "overdue",
}

export interface CreateBookLoanInput extends Omit<BookLoan, "id" | "created_at"> {}
export interface UpdateBookLoanInput extends Partial<CreateBookLoanInput> {}