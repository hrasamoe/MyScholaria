import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(8, "Minimum 8 characters"),
  full_name: z.string().min(2, "Minimum 2 characters"),
  first_name: z.string().min(2, "Minimum 2 characters"),
  last_name: z.string().min(2, "Minimum 2 characters"),
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
  schoolName: z.string().min(4, "Schoolname is too short"),
});

export const registerMemberSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(8, "Minimum 8 characters"),
  joinCode: z.string().min(1, "Please provide your Establishment JoinCOde"),
  full_name: z.string().min(2, "Please provide your fullname."),
  last_name: z.string().min(2, "Minimum 2 characters"),
  first_name: z.string().min(2, "Minimum 2 characters"),
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
  schoolID: z.string().min(3, "Etablishment ID is too short"),
});

export const loginSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
