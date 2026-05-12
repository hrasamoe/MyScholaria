export interface Invoice {
  id: string; // uuid
  student_id: string; // FK students.id
  invoice_number: string; // UNIQUE
  issue_date: Date;
  due_date: Date;
  total: number;
  tax: number;
  status: InvoiceStatus;
  pdf_url?: string;
  created_at: Date;
  updated_at: Date;
}

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export interface CreateInvoiceInput extends Omit<Invoice, "id" | "created_at" | "updated_at"> {}
export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {}