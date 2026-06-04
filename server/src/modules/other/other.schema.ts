import { z } from "zod";

const phoneRegex = /^(?:\+261\s?|0)\s?(?:32|33|34|37|38)(?:[\s-]?\d){7}$/;

export const parentSchema = z.object({
  firstName: z.string().min(2, "Please provide the parent's first name"),
  lastName: z.string().min(2, "Please provide the parent's last name"),
  email: z
    .string()
    .email("Please provide a valid email address")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female"]),
  profession: z.string().min(0),
  phone: z
    .string()
    .regex(phoneRegex, "Please provide a valid Malagasy phone number"),
  address: z.string().min(5, "Please provide a valid address"),
  fullname: z.string().min(5, "Please provide a valid full name"),
});

export const roomSchema = z.object({
  name: z.string().min(2, "Please provide the room name"),
  building: z.string().min(2, "Please provide the building name"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  type: z.enum([
    "Lecture Hall",
    "Standard Classroom",
    "Computer Lab",
    "Science Lab",
    "Workshop",
    "Meeting Room",
    "Exam Hall",
  ]),
  equipment: z.string().min(0),
});

export type ParentInfo = z.infer<typeof parentSchema>;
export type RoomInfo = z.infer<typeof roomSchema>;
