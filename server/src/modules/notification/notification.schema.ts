import { z } from "zod";

export const notificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  target: z
    .array(z.string().uuid("Invalid user ID"))
    .min(1, "At least one target user is required"),
  expiration_date: z
    .string()
    .min(6, "Expiration date must be in YYYY-MM-DD format"),
});

export type NotifInfo = z.infer<typeof notificationSchema>;
