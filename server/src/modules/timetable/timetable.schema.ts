import { z } from "zod";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

export const slotSchema = z
  .object({
    classID: z.string().uuid({ message: "classID must be a valid id" }),
    subjectID: z.string().uuid({ message: "subjectID must be a valid id" }),
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

export type SlotInfo = z.infer<typeof slotSchema>