export interface Payment {
  id: string; // uuid
  invoice_id: string; // FK invoices.id
  student_id: string; // FK students.id
  amount: number;
  method: PaymentMethod;
  payment_date: Date;
  reference?: string;
  received_by?: string; // FK profiles.id
  receipt_url?: string;
  created_at: Date;
}

export enum PaymentMethod {
  CASH = "cash",
  CHEQUE = "cheque",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  MOBILE_MONEY = "mobile_money",
  OTHER = "other",
}

export interface CreatePaymentInput extends Omit<Payment, "id" | "created_at"> {}
export interface UpdatePaymentInput extends Partial<CreatePaymentInput> {}