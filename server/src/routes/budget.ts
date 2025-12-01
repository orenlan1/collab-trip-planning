import express from 'express';
import { isAuthenticated, isTripMember, isExpenseTripMember } from '../middleware/auth.js';
import validateResource from '../middleware/validateResource.js';
import { createOrUpdateBudgetSchema, createExpenseSchema, updateExpenseSchema } from '../schemas/budget-schema.js';
import budgetController from '../controllers/budget-controller.js';

const router = express.Router();

// POST /api/trips/:tripId/budget - Create or update a trip's budget
router.post(
    "/trips/:tripId/budget",
    isAuthenticated,
    isTripMember,
    validateResource(createOrUpdateBudgetSchema),
    budgetController.createOrUpdateBudget
);

// GET /api/trips/:tripId/budget - Get budget with expenses aggregated by category
router.get(
    "/trips/:tripId/budget",
    isAuthenticated,
    isTripMember,
    budgetController.getBudget
);

// POST /api/trips/:tripId/budget/expenses - Add an expense to the trip's budget
router.post(
    "/trips/:tripId/budget/expenses",
    isAuthenticated,
    isTripMember,
    validateResource(createExpenseSchema),
    budgetController.addExpense
);

// GET /api/trips/:tripId/budget/summary - Get spending summary by category
router.get(
    "/trips/:tripId/budget/summary",
    isAuthenticated,
    isTripMember,
    budgetController.getSummary
);

// GET /api/trips/:tripId/budget/expenses - Get paginated expenses
router.get(
    "/trips/:tripId/budget/expenses",
    isAuthenticated,
    isTripMember,
    budgetController.getExpenses
);

// PATCH /api/budget/expenses/:expenseId - Update an expense
router.patch(
    "/budget/expenses/:expenseId",
    isAuthenticated,
    isExpenseTripMember,
    validateResource(updateExpenseSchema),
    budgetController.updateExpense
);

// DELETE /api/budget/expenses/:expenseId - Delete an expense
router.delete(
    "/budget/expenses/:expenseId",
    isAuthenticated,
    isExpenseTripMember,
    budgetController.deleteExpense
);

export default router;
