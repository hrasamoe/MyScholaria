export interface EventRegistration {
  id: string; // uuid
  event_id: string; // FK events.id
  student_id: string; // FK students.id
  registered_at: Date;
  payment_status: PaymentStatus;
  attended: boolean;
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  WAIVED = "waived",
}

export interface CreateEventRegistrationInput extends Omit<EventRegistration, "id" | "registered_at"> {}
export interface UpdateEventRegistrationInput extends Partial<CreateEventRegistrationInput> {}