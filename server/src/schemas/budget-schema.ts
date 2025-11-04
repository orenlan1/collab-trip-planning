import { z } from 'zod';

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
        category: z.enum(["TRANSPORTATION", "ACCOMMODATION", "ACTIVITIES", "FOOD", "MISCELLANEOUS"], {
            message: "Category must be one of: TRANSPORTATION, ACCOMMODATION, ACTIVITIES, FOOD, MISCELLANEOUS"
        }),
        activityId: z.string().optional().nullable()
    })
});

export type CreateOrUpdateBudgetInput = z.infer<typeof createOrUpdateBudgetSchema>['body'];
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
