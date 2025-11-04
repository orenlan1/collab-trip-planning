import { prisma } from '../prisma/client.js';
import type { CreateOrUpdateBudgetInput, CreateExpenseInput } from '../schemas/budget-schema.js';
import type { ExpenseCategory } from '@prisma/client';

// Create or update a budget for a trip
const createOrUpdate = async (tripId: string, data: CreateOrUpdateBudgetInput) => {
    // Check if budget already exists
    const existingBudget = await prisma.budget.findUnique({
        where: { tripId }
    });

    if (existingBudget) {
        // Update existing budget
        const updatedBudget = await prisma.budget.update({
            where: { tripId },
            data: {
                totalPerPerson: data.totalPerPerson,
                currency: data.currency
            },
            include: {
                expenses: {
                    include: {
                        activity: true
                    }
                }
            }
        });
        return updatedBudget;
    } else {
        // Create new budget
        const newBudget = await prisma.budget.create({
            data: {
                tripId,
                totalPerPerson: data.totalPerPerson,
                currency: data.currency
            },
            include: {
                expenses: {
                    include: {
                        activity: true
                    }
                }
            }
        });
        return newBudget;
    }
};

// Get budget with expenses
const getBudgetByTripId = async (tripId: string) => {
    const budget = await prisma.budget.findUnique({
        where: { tripId },
        include: {
            expenses: {
                include: {
                    activity: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!budget) {
        return null;
    }

    // Aggregate expenses by category using SQL groupBy
    const aggregatedExpenses = await prisma.expense.groupBy({
        by: ['category'],
        _sum: { cost: true },
        where: { budgetId: budget.id }
    });

    // Convert to record format
    const expensesByCategory: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
    
    // Ensure all categories are present
    const allCategories: ExpenseCategory[] = ['TRANSPORTATION', 'ACCOMMODATION', 'ACTIVITIES', 'FOOD', 'MISCELLANEOUS'];
    allCategories.forEach(category => {
        expensesByCategory[category] = 0;
    });

    // Fill in actual values
    aggregatedExpenses.forEach(item => {
        expensesByCategory[item.category] = item._sum.cost || 0;
    });

    return {
        ...budget,
        expensesByCategory
    };
};

// Add an expense to a budget
const addExpense = async (tripId: string, data: CreateExpenseInput) => {
    // First, ensure the budget exists
    let budget = await prisma.budget.findUnique({
        where: { tripId }
    });

    if (!budget) {
        throw new Error('Budget does not exist for this trip. Please create a budget first.');
    }

    // Validate activityId if provided
    if (data.activityId) {
        const activity = await prisma.activity.findUnique({
            where: { id: data.activityId },
            include: {
                tripDay: {
                    include: {
                        itinerary: true
                    }
                }
            }
        });

        if (!activity) {
            throw new Error('Activity not found');
        }

        if (activity.tripDay.itinerary.tripId !== tripId) {
            throw new Error('Activity does not belong to this trip');
        }

        // Check if activity already has an expense
        const existingExpense = await prisma.expense.findUnique({
            where: { activityId: data.activityId }
        });

        if (existingExpense) {
            throw new Error('This activity already has an associated expense');
        }
    }

    // Create the expense
    const expense = await prisma.expense.create({
        data: {
            budgetId: budget.id,
            description: data.description,
            cost: data.cost,
            category: data.category,
            activityId: data.activityId || null
        },
        include: {
            activity: true
        }
    });

    return expense;
};

// Delete an expense
const deleteExpense = async (expenseId: string) => {
    // Check if expense exists
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    await prisma.expense.delete({
        where: { id: expenseId }
    });

    return { message: 'Expense deleted successfully' };
};

// Get budget summary with spending breakdown
const getSummary = async (tripId: string) => {
    const budget = await prisma.budget.findUnique({
        where: { tripId },
        include: {
            trip: {
                include: {
                    members: true
                }
            }
        }
    });

    if (!budget) {
        throw new Error('Budget not found for this trip');
    }

    // Aggregate expenses by category using SQL groupBy
    const aggregatedExpenses = await prisma.expense.groupBy({
        by: ['category'],
        _sum: { cost: true },
        where: { budgetId: budget.id }
    });

    // Convert to record format
    const expensesByCategory: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;
    
    // Ensure all categories are present
    const allCategories: ExpenseCategory[] = ['TRANSPORTATION', 'ACCOMMODATION', 'ACTIVITIES', 'FOOD', 'MISCELLANEOUS'];
    allCategories.forEach(category => {
        expensesByCategory[category] = 0;
    });

    // Fill in actual values and calculate total spent
    let totalSpent = 0;
    aggregatedExpenses.forEach(item => {
        const cost = item._sum.cost || 0;
        expensesByCategory[item.category] = cost;
        totalSpent += cost;
    });

    // Calculate total budget (per person * number of members)
    const numberOfMembers = budget.trip.members.length;
    const totalBudget = budget.totalPerPerson * numberOfMembers;

    // Calculate remaining
    const remaining = totalBudget - totalSpent;

    return {
        ...expensesByCategory,
        totalSpent,
        totalBudget,
        totalPerPerson: budget.totalPerPerson,
        numberOfMembers,
        remaining,
        currency: budget.currency
    };
};

export default {
    createOrUpdate,
    getBudgetByTripId,
    addExpense,
    deleteExpense,
    getSummary
};
