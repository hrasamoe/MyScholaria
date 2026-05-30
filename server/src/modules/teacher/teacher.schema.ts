import { z } from "zod";

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;

export const teacherSchema = z.object({
  IDNumber: z.string().min(5, "Please provide a valid ID number"),
  firstName: z.string().min(2, "Please provide the teacher's first name"),
  lastName: z.string().min(2, "Please provide the teacher's last name"),
  hire_date: z.string().min(1, "Please provide a hire date"),
  subject: z.enum([
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "French",
    "Malagasy",
    "Phylosophy",
    "History & Geography",
    "Computer Science",
    "Physical Education",
    "Art & Music",
  ]),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().regex(phoneRegex, "Invalid phone number").optional(),
  address: z.string().min(5, "Invalid address").optional(),
  gender: z.enum(["male", "female"]).optional(),
  contractType: z.enum(["permanent", "contract", "vacation"]).optional(),
  hpw: z.number().int().nonnegative().optional(),
  qualification: z.string().min(0, "Please provide a qualification"),
});

export type TeacherInfo = z.infer<typeof teacherSchema>;
