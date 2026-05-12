export interface Event {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  title: string;
  description?: string;
  start_at: Date;
  end_at: Date;
  location?: string;
  type?: string;
  capacity?: number;
  cover_image_url?: string;
  created_at: Date;
}

export interface CreateEventInput extends Omit<Event, "id" | "created_at"> {}
export interface UpdateEventInput extends Partial<CreateEventInput> {}