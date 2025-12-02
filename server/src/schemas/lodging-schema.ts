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
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
});

export const updateLodgingSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    checkIn: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined).optional(),
    checkOut: dateStringSchema.transform(val => val ? new Date(`${val}T00:00:00.000Z`) : undefined).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
  })
});

export type CreateLodgingInput = {
  name: string;
  address: string;
  checkIn: Date | null;
  checkOut: Date | null;
  latitude?: number;
  longitude?: number;
};

export type UpdateLodgingInput = {
  name?: string;
  address?: string;
  checkIn?: Date;
  checkOut?: Date;
  latitude?: number;
  longitude?: number;
};