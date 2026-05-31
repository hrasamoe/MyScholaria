import { z } from "zod";

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;

export const studentSchema = z.object({
  firstName: z.string().min(2, "Please provide the student's first name"),
  lastName: z.string().min(2, "Please provide the student's last name"),
  birth_date: z.string().min(1, "Please provide a birth date"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().regex(phoneRegex, "Invalid phone number").optional(),
  address: z.string().min(5, "Invalid address").optional(),
  gender: z.enum(["male", "female"]),
  classID: z.string().min(1, "Please provide a class"),
  parentID: z.string().min(1, "Please provide a parent"),
});

export type StudentInfo = z.infer<typeof studentSchema>;