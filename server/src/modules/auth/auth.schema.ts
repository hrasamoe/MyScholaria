import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(8, "Minimum 8 characters"),
  full_name: z.string().min(2, "Minimum 2 characters"),
  role: z
    .enum([
      "admin",
      "teacher",
      "accountant",
      "supervisor",
      "parent",
      "student",
      "librarian",
    ])
    .default("student"),
});

export const loginSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
