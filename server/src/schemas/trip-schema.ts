
import { z } from 'zod';

const dateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(val => !isNaN(Date.parse(val)), "Invalid date");

export const createTripSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        destination: z.string().optional().nullable().default(null),
        description: z.string().optional().nullable().default(null),
        startDate: dateStringSchema.optional().transform(val => val ? new Date(`${val}T00:00:00.000Z`) : null),
        endDate: dateStringSchema.optional().transform(val => val ? new Date(`${val}T00:00:00.000Z`) : null),
    }).superRefine((data, ctx) => {
        if (data.startDate && data.endDate) {
            if (data.endDate <= data.startDate) {
                ctx.addIssue({
                    path: ['endDate'],
                    code: z.ZodIssueCode.custom,
                    message: "End date must be after start date",
                });
            }
        }
    })
});

export const updateTripSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").optional(),
        destination: z.string().optional(),
        description: z.string().optional(),
        startDate: dateStringSchema.optional().transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined),
        endDate: dateStringSchema.optional().transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined),
    })
});

export type CreateTripInput = z.infer<typeof createTripSchema>['body'];
export type UpdateTripInput = z.infer<typeof updateTripSchema>['body'];