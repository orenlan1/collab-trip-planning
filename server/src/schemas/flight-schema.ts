import { z } from "zod";

// Schema for ISO 8601 datetime format: "2025-10-30T14:45:00Z"
const dateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)")
  .refine(val => !isNaN(Date.parse(val)), "Invalid date");

export const createFlightSchema = z.object({
  body: z.object({
    airline: z.string().min(1, "Airline is required"),
    flightNumber: z.string().min(1, "Flight number is required"),
    departure: dateStringSchema,
    arrival: dateStringSchema,
    from: z.string().min(3, "Departure location must be at least 3 characters"),
    to: z.string().min(3, "Arrival location must be at least 3 characters"),
    departureTimezoneId: z.string().optional(),
    arrivalTimezoneId: z.string().optional(),
  })
});

export const updateFlightSchema = z.object({
  body: z.object({
    airline: z.string().min(1, "Airline is required").optional(),
    flightNumber: z.string().min(1, "Flight number is required").optional(),
    departure: dateStringSchema.optional(),
    arrival: dateStringSchema.optional(),
    from: z.string().min(3, "Departure location must be at least 3 characters").optional(),
    to: z.string().min(3, "Arrival location must be at least 3 characters").optional(),
    departureTimezoneId: z.string().optional(),
    arrivalTimezoneId: z.string().optional(),
  })
});

export type CreateFlightInput = z.infer<typeof createFlightSchema>['body'];
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>['body'];