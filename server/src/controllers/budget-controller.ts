import type { Request, Response } from "express";
import budgetService from "../services/budget-service.js";
import type { CreateOrUpdateBudgetInput, CreateExpenseInput } from "../schemas/budget-schema.js";

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

// DELETE /api/budget/expenses/:expenseId - Delete an expense
const deleteExpense = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { expenseId } = req.params;
    
    if (!expenseId) {
        return res.status(400).json({ error: "Expense ID is required" });
    }

    try {
        const result = await budgetService.deleteExpense(expenseId);
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

export default {
    createOrUpdateBudget,
    getBudget,
    addExpense,
    deleteExpense,
    getSummary
};
