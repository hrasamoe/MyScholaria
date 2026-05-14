import { z } from "zod";

export const establishementSchema = z
  .object({
    code: z
      .string()
      .min(3, "Establishment code must be at least 3 characters")
      .regex(
        /^[A-Z0-9\-]+$/,
        "Code must contain only uppercase letters, numbers and hyphens",
      ),

    name: z.string().min(3, "Establishment name must be at least 3 characters"),

    type: z.enum(["primary", "middle", "high", "university", "other"], {
      message: "Please select a valid establishment type",
    }),

    identificationNumber: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    owner_id: z.string().uuid("Invalid owner ID"),
    address: z.string().min(5, "Adress must be at least 5 characters"),
    city: z.string().min(2, "City name must be at least 2 characters"),
    zipCode: z.string().min(2, "ZIP code is invalid"),
    // country: z.string().min(2, "Country name must be at least 2 characters"),

    phone: z
      .string()
      .regex(/^\+?[\d\s\-()]{10,}$/, "Phone number must be at least 10 digits"),
    email: z.string().email("Please provide a valid email address"),

    joinCode: z
      .string()
      .min(6, "Join code must be at least 6 characters")
      .toUpperCase(),

    adminCode: z
      .string()
      .min(6, "Admin code must be at least 6 characters")
      .toUpperCase(),

    isActive: z.boolean().default(true),
  })
  .refine((data) => data.joinCode !== data.adminCode, {
    message: "Join code and admin code must be different",
    path: ["adminCode"],
  });

export const joinSchema = z.object({
  userID: z.string().min(2, "TOken misssing"),
  establishmentID: z.string().min(2, "Missing establishment ID"),
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

export type JoinInput = z.infer<typeof joinSchema>;
export type EstablishmentInput = z.infer<typeof establishementSchema>;
