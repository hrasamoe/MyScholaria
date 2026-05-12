export interface InvoiceLine {
  id: string; // uuid
  invoice_id: string; // FK invoices.id
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateInvoiceLineInput extends Omit<InvoiceLine, "id" | "total"> {}
export interface UpdateInvoiceLineInput extends Partial<CreateInvoiceLineInput> {}