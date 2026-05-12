export interface EventActivity {
  id: string; // uuid
  event_id: string; // FK events.id
  name: string;
  description?: string;
  start_at: Date;
  end_at: Date;
  instructor?: string;
  max_participants?: number;
}

export interface CreateEventActivityInput extends Omit<EventActivity, "id"> {}
export interface UpdateEventActivityInput extends Partial<CreateEventActivityInput> {}