import { z } from "zod";

const phoneRegex =
  /^(?:\+261|0)(?:32|33|34|37|38)(?:\d{7}|\d{2}\s\d{2}\s\d{3}\s\d{2})$/;

export const parentSchema = z.object({
  firstName: z.string().min(2, "Please provide the parent's first name"),
  lastName: z.string().min(2, "Please provide the parent's last name"),
  email: z.string().email("Please provide a valid email address"),
  gender: z.enum(["male", "female"]),
  profession: z.string().min(0),
  phone: z
    .string()
    .regex(phoneRegex, "Please provide a valid Malagasy phone number"),
  address: z.string().min(5, "Please provide a valid address"),
  fullname: z.string().min(5, "Please provide a valid full name"),
});

export type ParentInfo = z.infer<typeof parentSchema>;
