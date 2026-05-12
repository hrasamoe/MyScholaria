export interface Conversation {
  id: string; // uuid
  participants: string[]; // jsonb - array of user IDs
  last_message_at: Date;
}

export interface CreateConversationInput extends Omit<Conversation, "id"> {}
export interface UpdateConversationInput extends Partial<CreateConversationInput> {}