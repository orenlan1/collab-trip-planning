import type { Request, Response } from "express";
import budgetService from "../services/budget-service.js";
import type { CreateOrUpdateBudgetInput, CreateExpenseInput, UpdateExpenseInput } from "../schemas/budget-schema.js";
import type { TypedServer } from "../sockets/types.js";

// POST /api/trips/:tripId/budget - Create or update a trip's budget
const createOrUpdateBudget = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }
    
    const data = req.body as CreateOrUpdateBudgetInput;

    try {
        const budget = await budgetService.createOrUpdate(tripId, data);
        res.status(200).json(budget);
    } catch (error) {
        console.error("Error creating/updating budget:", error);
        res.status(500).json({ error: "Failed to create or update budget" });
    }
};

// GET /api/trips/:tripId/budget - Get budget with expenses aggregated by category
const getBudget = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const budget = await budgetService.getBudgetByTripId(tripId);
        
        if (!budget) {
            return res.status(404).json({ error: "Budget not found for this trip" });
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        res.status(500).json({ error: "Failed to fetch budget" });
    }
};

// POST /api/trips/:tripId/budget/expenses - Add an expense to the trip's budget
const addExpense = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }
    
    const data = req.body as CreateExpenseInput;

    try {
        const expense = await budgetService.addExpense(tripId, data);
        if (expense.activity) {
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
    } catch (error: any) {
        console.error("Error adding expense:", error);
        
        // Handle specific error messages from service
        if (error.message === 'Budget does not exist for this trip. Please create a budget first.') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Activity not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Activity does not belong to this trip') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'This activity already has an associated expense') {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to add expense" });
    }
};

// PATCH /api/trips/:tripId/budget/expenses/:expenseId - Update an expense
const updateExpense = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId, expenseId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }
    
    if (!expenseId) {
        return res.status(400).json({ error: "Expense ID is required" });
    }

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
    } catch (error: any) {
        console.error("Error updating expense:", error);
        
        if (error.message === 'Expense not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to update expense" });
    }
};

// DELETE /api/trips/:tripId/budget/expenses/:expenseId - Delete an expense
const deleteExpense = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId, expenseId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }
    
    if (!expenseId) {
        return res.status(400).json({ error: "Expense ID is required" });
    }

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
    } catch (error: any) {
        console.error("Error deleting expense:", error);
        
        if (error.message === 'Expense not found') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to delete expense" });
    }
};

// GET /api/trips/:tripId/budget/summary - Get spending summary by category
const getSummary = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const summary = await budgetService.getSummary(tripId);
        res.status(200).json(summary);
    } catch (error: any) {
        console.error("Error fetching budget summary:", error);
        
        if (error.message === 'Budget not found for this trip') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to fetch budget summary" });
    }
};

// GET /api/trips/:tripId/budget/expenses - Get paginated expenses
const getExpenses = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    if (page < 1 || limit < 1 || limit > 50) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    try {
        const result = await budgetService.getExpenses(tripId, page, limit);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching expenses:", error);
        
        if (error.message === 'Budget not found for this trip') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

// GET /api/trips/:tripId/budget/user-spending - Get current user's own spending
const getUserSpending = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { tripId } = req.params;
    
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const result = await budgetService.getUserSpending(tripId, req.user.id);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error fetching user spending:", error);
        
        if (error.message === 'Budget not found for this trip') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'User is not a member of this trip') {
            return res.status(403).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to fetch user spending" });
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
