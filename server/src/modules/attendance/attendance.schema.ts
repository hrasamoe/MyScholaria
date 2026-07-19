import { z } from "zod";

export const markAttendanceSchema = z.object({
  classSubjectID: z.string().uuid(),
  date: z.string(), // ISO date, e.g. "2026-07-19"
  entries: z
    .array(
      z.object({
        studentID: z.string().uuid(),
        status: z.enum(["present", "absent", "late", "excused"]),
        comment: z.string().optional(),
      }),
    )
    .min(1, "At least one attendance entry is required"),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
