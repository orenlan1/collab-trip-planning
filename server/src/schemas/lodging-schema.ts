import { z } from "zod";


const dateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(val => !isNaN(Date.parse(val)), "Invalid date");

export const createLodgingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    checkIn: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : null),
    checkOut: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : null),
    guests: z.number().min(1, "At least one guest is required"),
  })
});

export const updateLodgingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    checkIn: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined).optional(),
    checkOut: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined).optional(),
    guests: z.number().min(1, "At least one guest is required").optional(),
  })
});

export type CreateLodgingInput = z.infer<typeof createLodgingSchema>['body'];
export type UpdateLodgingInput = z.infer<typeof updateLodgingSchema>['body'];