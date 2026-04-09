import type { Request, Response, NextFunction } from "express";
import budgetService from "../services/budget-service.js";
import type { CreateOrUpdateBudgetInput, CreateExpenseInput, UpdateExpenseInput } from "../schemas/budget-schema.js";
import type { TypedServer } from "../sockets/types.js";
import { NotFoundError } from "../errors/AppError.js";

// POST /api/trips/:tripId/budget - Create or update a trip's budget
const createOrUpdateBudget = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const data = req.body as CreateOrUpdateBudgetInput;
    try {
        const budget = await budgetService.createOrUpdate(tripId, data);
        res.status(200).json(budget);
    } catch (error) {
        next(error);
    }
};

// GET /api/trips/:tripId/budget - Get budget with expenses aggregated by category
const getBudget = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const budget = await budgetService.getBudgetByTripId(tripId);
        if (!budget) {
            throw new NotFoundError("Budget not found for this trip");
        }
        res.status(200).json(budget);
    } catch (error) {
        next(error);
    }
};

// POST /api/trips/:tripId/budget/expenses - Add an expense to the trip's budget
const addExpense = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const data = req.body as CreateExpenseInput;
    try {
        const expense = await budgetService.addExpense(tripId, data);
        if (expense && expense.activity) {
            const io: TypedServer = req.app.get('io');
            io.to(`trip:${tripId}`).emit('activity:expense:created', {
                activityId: expense.activity.id,
                creatorId: req.user!.id,
                creatorName: req.user!.name,
                expense: {
                    id: expense.id,
                    description: expense.description,
                    cost: expense.cost,
                    currency: expense.currency,
                    category: expense.category,
                    date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
                    createdAt: expense.createdAt instanceof Date ? expense.createdAt.toISOString() : expense.createdAt,
                    updatedAt: expense.updatedAt instanceof Date ? expense.updatedAt.toISOString() : expense.updatedAt
                }
            });
        }
        res.status(201).json(expense);
    } catch (error) {
        next(error);
    }
};

// PATCH /api/trips/:tripId/budget/expenses/:expenseId - Update an expense
const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const expenseId = req.params.expenseId!;
    const data = req.body as UpdateExpenseInput;
    try {
        const expense = await budgetService.updateExpense(tripId, expenseId, data);
        if (expense.activityId) {
            const io: TypedServer = req.app.get('io');
            io.to(`trip:${tripId}`).emit('activity:expense:updated', {
                activityId: expense.activityId,
                creatorId: req.user!.id,
                creatorName: req.user!.name,
                expense: {
                    id: expense.id,
                    description: expense.description,
                    cost: expense.cost,
                    currency: expense.currency,
                    category: expense.category,
                    date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
                    createdAt: expense.createdAt instanceof Date ? expense.createdAt.toISOString() : expense.createdAt,
                    updatedAt: expense.updatedAt instanceof Date ? expense.updatedAt.toISOString() : expense.updatedAt
                }
            });
        }
        res.status(200).json(expense);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/trips/:tripId/budget/expenses/:expenseId - Delete an expense
const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const expenseId = req.params.expenseId!;
    try {
        const result = await budgetService.deleteExpense(expenseId);
        if (result.activityId) {
            const io: TypedServer = req.app.get('io');
            io.to(`trip:${tripId}`).emit('activity:expense:deleted', {
                activityId: result.activityId,
                deletedById: req.user!.id,
                deletedByName: req.user!.name
            });
        }
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// GET /api/trips/:tripId/budget/summary - Get spending summary by category
const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const summary = await budgetService.getSummary(tripId);
        res.status(200).json(summary);
    } catch (error) {
        next(error);
    }
};

// GET /api/trips/:tripId/budget/expenses - Get paginated expenses
const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    try {
        const result = await budgetService.getExpenses(tripId, page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// GET /api/trips/:tripId/budget/user-spending - Get current user's own spending
const getUserSpending = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const result = await budgetService.getUserSpending(tripId, req.user!.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export default {
    createOrUpdateBudget,
    getBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    getExpenses,
    getUserSpending
};
