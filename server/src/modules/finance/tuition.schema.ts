import { z } from "zod";

export const TuitionSchema = z.object({
  classID: z.string().uuid(),
  tuitionFee: z.number().min(0),
  registrationFee: z.number().min(0),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/),
  establishmentID: z.string().uuid(),
});

export const StudentTuitionSchema = z
  .object({
    base_monthly_tuition: z.coerce.number().min(0),
    discount_type: z.enum(["none", "percentage", "fixed"]).default("none"),
    discount_value: z.coerce.number().min(0).nullable().optional(),
    total_paid_amount: z.coerce.number().min(0),
    registration_fee: z.coerce.number().min(0),
    is_registration_fee_paid: z.boolean(),
    notes: z.string().nullable().optional(),
    tuition_months: z
      .array(
        z.object({
          id: z.coerce.string(),
          month: z.string(),
          amount_due: z.coerce.number().min(0),
          is_paid: z.boolean(),
        }),
      )
      .min(1),
  })
  .refine(
    (data) =>
      data.discount_type === "none" || data.discount_value !== undefined,
    {
      message: "discount_value requis si discount_type n'est pas 'none'",
      path: ["discount_value"],
    },
  );

export type TuitionInfo = z.infer<typeof TuitionSchema>;
export type StudentTuitionInfo = z.infer<typeof StudentTuitionSchema>;
