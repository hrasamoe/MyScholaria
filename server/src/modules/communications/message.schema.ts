import { z } from "zod";

export const MessageSchema = z.object({
  sender_id: z.string(),
  recipient_id: z.string(),
  content: z.string().min(1, "Message content cannot be empty"),
});

export type MessageInfo = z.infer<typeof MessageSchema>;
