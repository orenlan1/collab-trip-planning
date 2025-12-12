import { prisma } from '../prisma/client.js';
import type { CreateOrUpdateBudgetInput, CreateExpenseInput, UpdateExpenseInput } from '../schemas/budget-schema.js';
import type { ExpenseCategory } from '@prisma/client';
import { convertCurrency } from '../apiClients/unirate/unirate.js';

/**
 * Group expenses by currency and category, then aggregate totals with minimal API calls
 * @param expenses - Array of expenses with cost, currency, and category
 * @param targetCurrency - Currency to convert all amounts to
 * @returns Promise resolving to expenses aggregated by category in target currency
 */
const aggregateExpensesByCategoryWithConversion = async (
    expenses: Array<{ cost: number; currency: string; category: ExpenseCategory }>,
    targetCurrency: string
): Promise<Record<ExpenseCategory, number>> => {
    // Initialize result with all categories at 0
    const expensesByCategory: Record<ExpenseCategory, number> = {
        TRANSPORTATION: 0,
        ACCOMMODATION: 0,
        ACTIVITIES: 0,
        FOOD: 0,
        MISCELLANEOUS: 0
    };

    // Group expenses by currency and category: { currency: { category: totalAmount } }
    const groupedByCurrencyAndCategory: Record<string, Record<ExpenseCategory, number>> = {};
    
    for (const expense of expenses) {
        if (!groupedByCurrencyAndCategory[expense.currency]) {
            groupedByCurrencyAndCategory[expense.currency] = {
                TRANSPORTATION: 0,
                ACCOMMODATION: 0,
                ACTIVITIES: 0,
                FOOD: 0,
                MISCELLANEOUS: 0
            };
        }
        const categoryTotals = groupedByCurrencyAndCategory[expense.currency];
        if (categoryTotals) {
            categoryTotals[expense.category] += expense.cost;
        }
    }

    // Convert each currency group to target currency (one API call per unique currency)
    for (const [currency, categoryTotals] of Object.entries(groupedByCurrencyAndCategory)) {
        // Skip conversion if already in target currency
        if (currency === targetCurrency) {
            for (const category of Object.keys(categoryTotals) as ExpenseCategory[]) {
                expensesByCategory[category] += categoryTotals[category];
            }
        } else {
            // Get exchange rate for this currency (1 API call per unique currency)
            try {
                // Convert 1 unit to get the rate
                const response = await convertCurrency(currency, targetCurrency, 1);
                const rate = response.result as number;
                
                // Apply rate to all categories for this currency
                for (const category of Object.keys(categoryTotals) as ExpenseCategory[]) {
                    expensesByCategory[category] += categoryTotals[category] * rate;
                }
            } catch (error) {
                console.error(`Failed to convert from ${currency} to ${targetCurrency}:`, error);
                // Use original amounts if conversion fails
                for (const category of Object.keys(categoryTotals) as ExpenseCategory[]) {
                    expensesByCategory[category] += categoryTotals[category];
                }
            }
        }
    }

    return expensesByCategory;
};

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

    // Get all expenses with their currencies
    const expenses = await prisma.expense.findMany({
        where: { budgetId: budget.id },
        select: {
            category: true,
            cost: true,
            currency: true
        }
    });

    // Use optimized aggregation with minimal API calls
    const expensesByCategory = await aggregateExpensesByCategoryWithConversion(expenses, budget.currency);

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

    let expenseDate: Date;

    // Validate activityId if provided and get date from trip day
    if (data.activityId) {
        const activity = await prisma.activity.findUnique({
            where: { id: data.activityId },
            include: {
                tripDay: {
                    select: {
                        date: true,
                        itinerary: {
                            select: {
                                tripId: true
                            }
                        }
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

        // Use the trip day's date (already a Date object, strip time component)
        const dateStr = activity.tripDay.date.toISOString().split('T')[0] as string;
        expenseDate = new Date(dateStr);
    } else {
        // If no activity, date must be provided or use current date
        if (data.date) {
            expenseDate = new Date(data.date);
        } else {
            // Default to today's date if not provided
            const todayStr = new Date().toISOString().split('T')[0] as string;
            expenseDate = new Date(todayStr);
        }
    }

    // Create the expense
    const expense = await prisma.expense.create({
        data: {
            budgetId: budget.id,
            description: data.description,
            cost: data.cost,
            currency: data.currency,
            category: data.category,
            date: expenseDate,
            activityId: data.activityId || null,
            flightId: data.flightId || null,
            lodgingId: data.lodgingId || null
        },
        include: {
            activity: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    tripDay: {
                        select: {
                            date: true
                        }
                    }
                }
            },
            flight: {
                select: {
                    id: true,
                    airline: true,
                    flightNumber: true,
                    from: true,
                    to: true
                }
            },
            lodging: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    checkIn: true,
                    checkOut: true
                }
            }
        }
    });

    return expense;
};

// Update an existing expense
const updateExpense = async (expenseId: string, data: UpdateExpenseInput): Promise<any> => {
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    const updateData: any = {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
    };

    const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: updateData,
        include: {
            activity: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    tripDay: {
                        select: {
                            date: true
                        }
                    }
                }
            },
            lodging: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    checkIn: true,
                    checkOut: true
                }
            }
        }
    });

    return updatedExpense;
};

// Delete an expense
const deleteExpense = async (expenseId: string) => {
    // Check if expense exists and get related data
    const expense = await prisma.expense.findUnique({
        where: { id: expenseId }
    });

    if (!expense) {
        throw new Error('Expense not found');
    }

    await prisma.expense.delete({
        where: { id: expenseId }
    });

    return { 
        message: 'Expense deleted successfully',
        activityId: expense.activityId
    };
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

    // Get all expenses with their currencies
    const expenses = await prisma.expense.findMany({
        where: { budgetId: budget.id },
        select: {
            category: true,
            cost: true,
            currency: true
        }
    });

    // Use optimized aggregation with minimal API calls
    const expensesByCategory = await aggregateExpensesByCategoryWithConversion(expenses, budget.currency);

    const totalSpent = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

    const numberOfMembers = budget.trip.members.length;
    
    if (budget.totalPerPerson === null) {
        return {
            ...expensesByCategory,
            totalSpent,
            totalBudget: 0,
            totalPerPerson: null,
            numberOfMembers,
            remaining: 0,
            currency: budget.currency
        };
    }

    const totalBudget = budget.totalPerPerson * numberOfMembers;
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

// Get paginated expenses for a trip
const getExpenses = async (tripId: string, page: number, limit: number): Promise<{
    expenses: Array<{
        id: string;
        description: string;
        cost: number;
        currency: string;
        category: ExpenseCategory;
        date: Date;
        activityId: string | null;
        activity: { id: string; name: string | null; description: string | null; tripDay: { date: Date } | null } | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}> => {
    const budget = await prisma.budget.findUnique({
        where: { tripId }
    });

    if (!budget) {
        throw new Error('Budget not found for this trip');
    }

    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Get total count of expenses
    const total = await prisma.expense.count({
        where: { budgetId: budget.id }
    });

    // Get paginated expenses
    const expenses = await prisma.expense.findMany({
        where: { budgetId: budget.id },
        include: {
            activity: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    tripDay: {
                        select: {
                            date: true
                        }
                    }
                }
            },
            flight: {
                select: {
                    id: true,
                    airline: true,
                    flightNumber: true,
                    from: true,
                    to: true
                }
            },
            lodging: {
                select: {
                    id: true,
                    name: true,
                    address: true,
                    checkIn: true,
                    checkOut: true
                }
            }
        },
        orderBy: {
            date: 'desc' // Order by expense date, not createdAt
        },
        skip,
        take: limit
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
        expenses,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore
        }
    };
};

export default {
    createOrUpdate,
    getBudgetByTripId,
    addExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    getExpenses
};
