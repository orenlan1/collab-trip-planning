import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import validateResource from '../middleware/validateResource.js';
import { createOrUpdateBudgetSchema, createExpenseSchema, updateExpenseSchema } from '../schemas/budget-schema.js';
import budgetController from '../controllers/budget-controller.js';

const router = express.Router({ mergeParams: true });

// POST /api/trips/:tripId/budget - Create or update a trip's budget
router.post(
    "/",
    isAuthenticated,
    validateResource(createOrUpdateBudgetSchema),
    budgetController.createOrUpdateBudget
);

// GET /api/trips/:tripId/budget - Get budget with expenses aggregated by category
router.get(
    "/",
    isAuthenticated,
    budgetController.getBudget
);

// GET /api/trips/:tripId/budget/summary - Get spending summary by category
router.get(
    "/summary",
    isAuthenticated,
    budgetController.getSummary
);

// GET /api/trips/:tripId/budget/user-spending - Get current user's own spending
router.get(
    "/user-spending",
    isAuthenticated,
    budgetController.getUserSpending
);

// POST /api/trips/:tripId/budget/expenses - Add an expense to the trip's budget
router.post(
    "/expenses",
    isAuthenticated,
    validateResource(createExpenseSchema),
    budgetController.addExpense
);

// GET /api/trips/:tripId/budget/expenses - Get paginated expenses
router.get(
    "/expenses",
    isAuthenticated,
    budgetController.getExpenses
);

// PATCH /api/trips/:tripId/budget/expenses/:expenseId - Update an expense
router.patch(
    "/expenses/:expenseId",
    isAuthenticated,
    validateResource(updateExpenseSchema),
    budgetController.updateExpense
);

// DELETE /api/trips/:tripId/budget/expenses/:expenseId - Delete an expense
router.delete(
    "/expenses/:expenseId",
    isAuthenticated,
    budgetController.deleteExpense
);

export default router;
