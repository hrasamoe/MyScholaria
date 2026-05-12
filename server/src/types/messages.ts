export interface Message {
  id: string; // uuid
  sender_id: string; // FK profiles.id
  recipient_id: string; // FK profiles.id
  subject?: string;
  body: string;
  attachments: any[]; // jsonb
  read_at?: Date;
  created_at: Date;
}

export interface CreateMessageInput extends Omit<Message, "id" | "created_at"> {}
export interface UpdateMessageInput extends Partial<CreateMessageInput> {}