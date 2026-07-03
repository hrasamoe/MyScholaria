import {z} from 'zod';

export const TuitionSchema = z.object({
    classID: z.string().uuid(),
    tuitionFee: z.number().min(0),
    registrationFee: z.number().min(0),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/), // Format: YYYY-YYYY
    establishmentID: z.string().uuid(),
})

export type TuitionInfo = z.infer<typeof TuitionSchema>;
