import { z } from "zod";

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;

export const staffSchema = z.object({
  firstName: z.string().min(2, "Please provide the teacher's first name"),
  lastName: z.string().min(2, "Please provide the teacher's last name"),
  gender: z.enum(["male", "female"]),
  birth_date: z.string().min(1, "Please provide a birth date"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Invalid address").optional().or(z.literal("")),
  position: z.string().min(3, "Please provide a staff position"),
  departement: z.string().min(3, "Please provide a staff departement"),
  hire_date: z.string().min(1, "Please provide a hire date"),
  contract_type: z.string().min(3, "Please provide the staff contract"),
  salary: z.number().positive("Please provide a staff salary"),
  status: z.string().min(2, "Please provide a staff status"),
});

export type StaffInfo = z.infer<typeof staffSchema>;
