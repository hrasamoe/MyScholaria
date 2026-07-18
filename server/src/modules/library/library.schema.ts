import { z } from "zod";

export const bookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  publisher: z.string().optional(),
  year: z.number().int().optional(),
  category: z.string().optional(),
  totalCopies: z.number().int().min(1, "Must have at least 1 copy"),
  location: z.string().optional(),
  coverUrl: z.string().optional(),
});

export const loanSchema = z.object({
  bookID: z.string().uuid(),
  borrowerID: z.string().uuid(),
  borrowerType: z.enum(["student", "teacher"]),
  dueDate: z.string(), // ISO date string
});

export type BookType = z.infer<typeof bookSchema>;
export type LoanType = z.infer<typeof loanSchema>;
