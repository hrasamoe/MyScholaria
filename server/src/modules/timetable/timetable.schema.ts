import { z } from "zod";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const scheduleSlotSchema = z
  .object({
    classID: z.string().uuid({ message: "classID must be a valid id" }),
    subject: z.string().min(1, "Subject is required"),
    teacherID: z
      .string()
      .uuid({ message: "teacherID must be a valid id" })
      .optional()
      .nullable(),
    roomID: z.string().uuid({ message: "roomID must be a valid id" }),
    day: z.enum(DAYS, {
      error: () => ({ message: "day must be a valid weekday" }),
    }),
    startTime: z.string().regex(timeRegex, "startTime must be in HH:mm format"),
    endTime: z.string().regex(timeRegex, "endTime must be in HH:mm format"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>;

export const updateScheduleSlotSchema = scheduleSlotSchema;
export type UpdateScheduleSlotInput = z.infer<typeof updateScheduleSlotSchema>;
