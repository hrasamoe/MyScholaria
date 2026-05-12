export interface Notification {
  id: string; // uuid
  user_id: string; // FK users.id
  type: string;
  title: string;
  body?: string;
  link?: string;
  read_at?: Date;
  created_at: Date;
}

export interface CreateNotificationInput extends Omit<Notification, "id" | "created_at"> {}
export interface UpdateNotificationInput extends Partial<CreateNotificationInput> {}