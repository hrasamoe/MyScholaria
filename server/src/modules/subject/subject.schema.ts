import { z } from "zod";

export const SubjectSchema = z.object({
  code: z.string().min(3, "Please create a subject Code at least 3 charachter"),
  name: z.string().min(3, "Please provide a valid subject name"),
  level: z.string().min(3, "Class required"),
  coefficient: z.number().int().nonnegative(),
  hours: z.number().int().nonnegative(),
});

export type SubjectInfo = z.infer<typeof SubjectSchema>