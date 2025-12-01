import { z } from 'zod';
import { isValidCurrencyCode } from '../services/currency-service';

// Schema for creating or updating a budget
export const createOrUpdateBudgetSchema = z.object({
    body: z.object({
        totalPerPerson: z.number().positive("Total per person must be a positive number"),
        currency: z.string().min(3, "Currency code must be at least 3 characters").max(3, "Currency code must be exactly 3 characters").default("USD")
    })
});

// Schema for creating an expense
export const createExpenseSchema = z.object({
    body: z.object({
        description: z.string().min(1, "Description is required"),
        cost: z.number().positive("Cost must be a positive number"),
        currency: z.string().min(3, "Currency code must be at least 3 characters").max(3, "Currency code must be exactly 3 characters").refine((code) => isValidCurrencyCode(code), {
            message: "Invalid currency code"
        }),
        category: z.enum(["TRANSPORTATION", "ACCOMMODATION", "ACTIVITIES", "FOOD", "MISCELLANEOUS"], {
            message: "Category must be one of: TRANSPORTATION, ACCOMMODATION, ACTIVITIES, FOOD, MISCELLANEOUS"
        }),
        activityId: z.string().optional().nullable(),
        flightId: z.string().optional().nullable(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
    })
});

export const updateExpenseSchema = z.object({
    body: z.object({
        description: z.string().min(1, "Description is required").optional(),
        cost: z.number().positive("Cost must be a positive number").optional(),
        currency: z.string().min(3, "Currency code must be at least 3 characters").max(3, "Currency code must be exactly 3 characters").refine((code) => isValidCurrencyCode(code), {
            message: "Invalid currency code"
        }).optional(),
        category: z.enum(["TRANSPORTATION", "ACCOMMODATION", "ACTIVITIES", "FOOD", "MISCELLANEOUS"], {
            message: "Category must be one of: TRANSPORTATION, ACCOMMODATION, ACTIVITIES, FOOD, MISCELLANEOUS"
        }).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
    })
});

export type CreateOrUpdateBudgetInput = z.infer<typeof createOrUpdateBudgetSchema>['body'];
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
