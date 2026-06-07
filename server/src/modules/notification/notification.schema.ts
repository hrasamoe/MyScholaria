import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(5, "Message must be at least 5 characters"),
  audience: z.enum(["student", "teacher", "parent", "all", "admin", "staff"], {
    message: "Invalid audience",
  }),
  target_user_ids: z.array(z.string()).nullable().optional().default([]),
  expires_at: z.string().nullable().optional(),
});

export const NotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  audience: z.enum(["student", "teacher", "parent", "all", "admin", "staff"], {
    message: "Invalid audience",
  }),
  type: z.enum(["info", "success", "warning", "announcement"], {
    message: "Invalid notification type",
  }),
  target_user_ids: z.array(z.string()).nullable().optional().default([]),
  expires_at: z.string().nullable().optional(),
});

export type NotificationInfo = z.infer<typeof NotificationSchema>;
export type AnnouncementInfo = z.infer<typeof announcementSchema>;
