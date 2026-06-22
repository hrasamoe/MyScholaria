import { z } from "zod";

export const calendarSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    type: z.enum([
      "Vacation",
      "Holidays",
      "Training days",
      "Exams periods",
      "School Trips",
      "Open Days",
      "Graduations",
      "Parent Meetings",
      "Sports Days",
      "Conferences",
    ]),
    isMultiDay: z.boolean(),
    description: z.string().optional(),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "Start time is required"),
  })
  .refine(
    (data) => {
      if (!data.isMultiDay) {
        return !!data.date;
      }
      return true;
    },
    {
      message: "Date is required for single days events",
      path: ["date"],
    },
  )
  .refine(
    (data) => {
      if (data.isMultiDay) {
        return !!data.startDate && !!data.endDate;
      }
      return true;
    },
    { message: "Start and end dates are required for multiple days events" },
  );

export type EventInfo = z.infer<typeof calendarSchema>;
