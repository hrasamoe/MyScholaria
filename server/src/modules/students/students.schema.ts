import { z } from "zod";

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;

export const studentSchema = z.object({
  firstName: z.string().min(2, "Please provide the student's first name"),
  lastName: z.string().min(2, "Please provide the student's last name"),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Invalid email",
    ),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  student_number: z.string().min(1, "Please provide a student ID"),
  enrollment_date: z.string().min(1, "Please provide an enrollment date"),
  class_id: z.string().optional(), // frontend : class_id
  status: z
    .enum(["active", "expelled", "transferred", "graduated"])
    .default("active"),
  medical_notes: z.string().optional(),
  photo_url: z.string().optional(),
  parent_ids: z.array(z.string()).default([]),
});


export type StudentInfo = z.infer<typeof studentSchema>;