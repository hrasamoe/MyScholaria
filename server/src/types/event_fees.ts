export interface EventFee {
  id: string; // uuid
  event_id: string; // FK events.id
  name: string;
  amount: number;
  mandatory: boolean;
}

export interface CreateEventFeeInput extends Omit<EventFee, "id"> {}
export interface UpdateEventFeeInput extends Partial<CreateEventFeeInput> {}