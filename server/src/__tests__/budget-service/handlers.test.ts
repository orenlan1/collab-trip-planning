import { describe, it, expect, vi, beforeEach } from 'vitest';
import budgetService from '../../services/budget-service.js';
import { prisma } from '../../prisma/client.js';
import { convertCurrency } from '../../apiClients/unirate/unirate.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError.js';

vi.mock('../../prisma/client.js', () => ({
    prisma: {
        budget: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        expense: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        expenseSplit: {
            createMany: vi.fn(),
            deleteMany: vi.fn(),
            findMany: vi.fn(),
        },
        tripMember: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
        activity: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('../../apiClients/unirate/unirate.js', () => ({
    convertCurrency: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createOrUpdate ───────────────────────────────────────────────────────────

describe('createOrUpdate', () => {
    const budgetData = { totalPerPerson: 500, currency: 'USD' };

    it('creates a new budget when none exists for the trip', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(null);
        vi.mocked(prisma.budget.create).mockResolvedValue({ id: 'b1', ...budgetData, tripId: 'trip-1' } as any);

        await budgetService.createOrUpdate('trip-1', budgetData);

        expect(prisma.budget.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ tripId: 'trip-1', ...budgetData }) })
        );
        expect(prisma.budget.update).not.toHaveBeenCalled();
    });

    it('updates the existing budget when one already exists', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({ id: 'b1', tripId: 'trip-1' } as any);
        vi.mocked(prisma.budget.update).mockResolvedValue({ id: 'b1', ...budgetData, tripId: 'trip-1' } as any);

        await budgetService.createOrUpdate('trip-1', budgetData);

        expect(prisma.budget.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { tripId: 'trip-1' }, data: budgetData })
        );
        expect(prisma.budget.create).not.toHaveBeenCalled();
    });
});

// ─── addExpense — splits ──────────────────────────────────────────────────────

describe('addExpense', () => {
    const baseBudget = { id: 'budget-1', tripId: 'trip-1' };
    const baseExpense = {
        id: 'expense-1',
        budgetId: 'budget-1',
        description: 'Dinner',
        cost: 90,
        currency: 'USD',
        category: 'FOOD',
        date: new Date(),
        activityId: null,
        flightId: null,
        lodgingId: null,
        activity: null,
        flight: null,
        lodging: null,
        splits: [],
    };

    it('throws NotFoundError when budget does not exist', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(null);

        await expect(
            budgetService.addExpense('trip-1', {
                description: 'Dinner',
                cost: 50,
                currency: 'USD',
                category: 'FOOD',
            } as any)
        ).rejects.toThrow(NotFoundError);
    });

    it('splits equally among the specified members', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([
            { id: 'm1' }, { id: 'm2' }, { id: 'm3' },
        ] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 3 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...baseExpense, splits: [] } as any);

        await budgetService.addExpense('trip-1', {
            description: 'Dinner',
            cost: 90,
            currency: 'USD',
            category: 'FOOD',
            splitMemberIds: ['m1', 'm2', 'm3'],
        } as any);

        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 30 },
                { expenseId: 'expense-1', memberId: 'm2', share: 30 },
                { expenseId: 'expense-1', memberId: 'm3', share: 30 },
            ],
        });
    });

    it('defaults to all trip members when no splitMemberIds are provided', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.tripMember.findMany)
            .mockResolvedValueOnce([{ id: 'm1' }, { id: 'm2' }] as any)
            .mockResolvedValueOnce([{ id: 'm1' }, { id: 'm2' }] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...baseExpense, splits: [] } as any);

        await budgetService.addExpense('trip-1', {
            description: 'Dinner',
            cost: 60,
            currency: 'USD',
            category: 'FOOD',
        } as any);

        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 30 },
                { expenseId: 'expense-1', memberId: 'm2', share: 30 },
            ],
        });
    });

    it('splits correctly with a single member (full cost)', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 1 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...baseExpense, splits: [] } as any);

        await budgetService.addExpense('trip-1', {
            description: 'Dinner',
            cost: 90,
            currency: 'USD',
            category: 'FOOD',
            splitMemberIds: ['m1'],
        } as any);

        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [{ expenseId: 'expense-1', memberId: 'm1', share: 90 }],
        });
    });

    it('throws BadRequestError and deletes the expense when a split member is not in the trip', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        // Only 1 of 2 provided members found → mismatch
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }] as any);
        vi.mocked(prisma.expense.delete).mockResolvedValue(baseExpense as any);

        await expect(
            budgetService.addExpense('trip-1', {
                description: 'Dinner',
                cost: 60,
                currency: 'USD',
                category: 'FOOD',
                splitMemberIds: ['m1', 'invalid-member'],
            } as any)
        ).rejects.toThrow(BadRequestError);

        expect(prisma.expense.delete).toHaveBeenCalledWith({ where: { id: 'expense-1' } });
    });

    it('stores each member\'s specified amount when splitAmounts is provided', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([
            { id: 'm1' }, { id: 'm2' }, { id: 'm3' },
        ] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 3 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...baseExpense, splits: [] } as any);

        await budgetService.addExpense('trip-1', {
            description: 'Dinner',
            cost: 90,
            currency: 'USD',
            category: 'FOOD',
            splitAmounts: [
                { memberId: 'm1', amount: 50 },
                { memberId: 'm2', amount: 25 },
                { memberId: 'm3', amount: 15 },
            ],
        } as any);

        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 50 },
                { expenseId: 'expense-1', memberId: 'm2', share: 25 },
                { expenseId: 'expense-1', memberId: 'm3', share: 15 },
            ],
        });
    });

    it('throws BadRequestError and deletes the expense when splitAmounts do not sum to total cost', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.expense.delete).mockResolvedValue(baseExpense as any);

        await expect(
            budgetService.addExpense('trip-1', {
                description: 'Dinner',
                cost: 90,
                currency: 'USD',
                category: 'FOOD',
                splitAmounts: [
                    { memberId: 'm1', amount: 50 },
                    { memberId: 'm2', amount: 20 }, // 70 total ≠ 90
                ],
            } as any)
        ).rejects.toThrow(BadRequestError);

        expect(prisma.expense.delete).toHaveBeenCalledWith({ where: { id: 'expense-1' } });
        expect(prisma.expenseSplit.createMany).not.toHaveBeenCalled();
    });

    it('accepts splitAmounts whose sum is within floating-point tolerance (< 0.01)', async () => {
        // 33.33 + 33.33 + 33.34 = 100.00 but FP may produce 99.99999...
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        const expense100 = { ...baseExpense, cost: 100 };
        vi.mocked(prisma.expense.create).mockResolvedValue(expense100 as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([
            { id: 'm1' }, { id: 'm2' }, { id: 'm3' },
        ] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 3 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...expense100, splits: [] } as any);

        await expect(
            budgetService.addExpense('trip-1', {
                description: 'Dinner',
                cost: 100,
                currency: 'USD',
                category: 'FOOD',
                splitAmounts: [
                    { memberId: 'm1', amount: 33.33 },
                    { memberId: 'm2', amount: 33.33 },
                    { memberId: 'm3', amount: 33.34 },
                ],
            } as any)
        ).resolves.not.toThrow();

        expect(prisma.expenseSplit.createMany).toHaveBeenCalled();
    });

    it('derives member IDs from splitAmounts and ignores splitMemberIds when both are provided', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(baseBudget as any);
        vi.mocked(prisma.expense.create).mockResolvedValue(baseExpense as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }, { id: 'm2' }] as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ ...baseExpense, splits: [] } as any);

        await budgetService.addExpense('trip-1', {
            description: 'Dinner',
            cost: 90,
            currency: 'USD',
            category: 'FOOD',
            splitMemberIds: ['m1', 'm2', 'm3'], // should be ignored
            splitAmounts: [
                { memberId: 'm1', amount: 60 },
                { memberId: 'm2', amount: 30 },
            ],
        } as any);

        // Should use custom amounts, not equal split of m1/m2/m3
        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 60 },
                { expenseId: 'expense-1', memberId: 'm2', share: 30 },
            ],
        });
    });
});

// ─── updateExpense — splits ───────────────────────────────────────────────────

describe('updateExpense', () => {
    const existingExpense = {
        id: 'expense-1',
        budgetId: 'budget-1',
        description: 'Lunch',
        cost: 60,
        currency: 'USD',
        category: 'FOOD',
        date: new Date(),
        activityId: null,
        budget: { tripId: 'trip-1' },
        splits: [
            { memberId: 'm1', share: 30 },
            { memberId: 'm2', share: 30 },
        ],
    };

    const updatedExpenseResult = {
        ...existingExpense,
        budget: undefined,
        activity: null,
        lodging: null,
    };

    it('updates splits with custom per-member amounts when splitAmounts is provided', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce(existingExpense as any);
        vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpenseResult as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }, { id: 'm2' }] as any);
        vi.mocked(prisma.expenseSplit.deleteMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce({ ...updatedExpenseResult, splits: [] } as any);

        await budgetService.updateExpense('trip-1', 'expense-1', {
            cost: 90,
            splitAmounts: [
                { memberId: 'm1', amount: 70 },
                { memberId: 'm2', amount: 20 },
            ],
        } as any);

        expect(prisma.expenseSplit.deleteMany).toHaveBeenCalledWith({ where: { expenseId: 'expense-1' } });
        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 70 },
                { expenseId: 'expense-1', memberId: 'm2', share: 20 },
            ],
        });
    });

    it('uses the new cost from the update payload when validating splitAmounts sum', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce(existingExpense as any);
        vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpenseResult as any);

        // splitAmounts sum to 90 but cost is updated to 90 → should pass
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }, { id: 'm2' }] as any);
        vi.mocked(prisma.expenseSplit.deleteMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce({ ...updatedExpenseResult, splits: [] } as any);

        await expect(
            budgetService.updateExpense('trip-1', 'expense-1', {
                cost: 90,
                splitAmounts: [
                    { memberId: 'm1', amount: 60 },
                    { memberId: 'm2', amount: 30 },
                ],
            } as any)
        ).resolves.not.toThrow();
    });

    it('throws BadRequestError when splitAmounts do not sum to updated cost', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce(existingExpense as any);
        vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpenseResult as any);

        await expect(
            budgetService.updateExpense('trip-1', 'expense-1', {
                cost: 90,
                splitAmounts: [
                    { memberId: 'm1', amount: 40 },
                    { memberId: 'm2', amount: 40 }, // 80 ≠ 90
                ],
            } as any)
        ).rejects.toThrow(BadRequestError);

        expect(prisma.expenseSplit.deleteMany).not.toHaveBeenCalled();
        expect(prisma.expenseSplit.createMany).not.toHaveBeenCalled();
    });

    it('falls back to existing expense cost when splitAmounts provided without a cost update', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce(existingExpense as any); // cost = 60
        vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpenseResult as any);
        vi.mocked(prisma.tripMember.findMany).mockResolvedValue([{ id: 'm1' }, { id: 'm2' }] as any);
        vi.mocked(prisma.expenseSplit.deleteMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue({ count: 2 } as any);
        vi.mocked(prisma.expense.findUnique).mockResolvedValueOnce({ ...updatedExpenseResult, splits: [] } as any);

        await budgetService.updateExpense('trip-1', 'expense-1', {
            splitAmounts: [
                { memberId: 'm1', amount: 45 },
                { memberId: 'm2', amount: 15 },
            ],
        } as any);

        // sum 60 = existing cost 60 → valid
        expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
            data: [
                { expenseId: 'expense-1', memberId: 'm1', share: 45 },
                { expenseId: 'expense-1', memberId: 'm2', share: 15 },
            ],
        });
    });
});

// ─── getSummary ───────────────────────────────────────────────────────────────

describe('getSummary', () => {
    it('throws NotFoundError when budget does not exist', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(null);

        await expect(budgetService.getSummary('no-trip')).rejects.toThrow(NotFoundError);
    });

    it('returns correct totalBudget, totalSpent, and remaining', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({
            id: 'budget-1',
            tripId: 'trip-1',
            totalPerPerson: 500,
            currency: 'USD',
            trip: { members: [{ id: 'm1' }, { id: 'm2' }] },
        } as any);
        vi.mocked(prisma.expense.findMany).mockResolvedValue([
            { category: 'FOOD', cost: 200, currency: 'USD' },
        ] as any);

        const result = await budgetService.getSummary('trip-1');

        // totalBudget = 500 * 2 = 1000, totalSpent = 200, remaining = 800
        expect(result.totalBudget).toBe(1000);
        expect(result.totalSpent).toBe(200);
        expect(result.remaining).toBe(800);
        expect(result.numberOfMembers).toBe(2);
    });

    it('returns remaining 0 and totalBudget 0 when totalPerPerson is null', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({
            id: 'budget-1',
            tripId: 'trip-1',
            totalPerPerson: null,
            currency: 'USD',
            trip: { members: [{ id: 'm1' }] },
        } as any);
        vi.mocked(prisma.expense.findMany).mockResolvedValue([
            { category: 'FOOD', cost: 100, currency: 'USD' },
        ] as any);

        const result = await budgetService.getSummary('trip-1');

        expect(result.totalPerPerson).toBeNull();
        expect(result.totalBudget).toBe(0);
        expect(result.remaining).toBe(0);
    });
});

// ─── deleteExpense ────────────────────────────────────────────────────────────

describe('deleteExpense', () => {
    it('throws NotFoundError when expense does not exist', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValue(null);

        await expect(budgetService.deleteExpense('bad-id')).rejects.toThrow(NotFoundError);
    });

    it('deletes expense and returns message with activityId', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ id: 'expense-1', activityId: 'act-1' } as any);
        vi.mocked(prisma.expense.delete).mockResolvedValue({} as any);

        const result = await budgetService.deleteExpense('expense-1');

        expect(prisma.expense.delete).toHaveBeenCalledWith({ where: { id: 'expense-1' } });
        expect(result.message).toBe('Expense deleted successfully');
        expect(result.activityId).toBe('act-1');
    });

    it('returns null activityId when expense has no linked activity', async () => {
        vi.mocked(prisma.expense.findUnique).mockResolvedValue({ id: 'expense-1', activityId: null } as any);
        vi.mocked(prisma.expense.delete).mockResolvedValue({} as any);

        const result = await budgetService.deleteExpense('expense-1');

        expect(result.activityId).toBeNull();
    });
});

// ─── getUserSpending ──────────────────────────────────────────────────────────

describe('getUserSpending', () => {
    it('throws NotFoundError when budget does not exist', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue(null);

        await expect(budgetService.getUserSpending('trip-1', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('throws ForbiddenError when user is not a trip member', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({ id: 'b1', currency: 'USD' } as any);
        vi.mocked(prisma.tripMember.findFirst).mockResolvedValue(null);

        await expect(budgetService.getUserSpending('trip-1', 'user-1')).rejects.toThrow(ForbiddenError);
    });

    it('returns total user spending without conversion when currencies match', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({ id: 'b1', currency: 'USD' } as any);
        vi.mocked(prisma.tripMember.findFirst).mockResolvedValue({ id: 'm1' } as any);
        vi.mocked(prisma.expenseSplit.findMany).mockResolvedValue([
            { share: 50, expense: { currency: 'USD' } },
            { share: 30, expense: { currency: 'USD' } },
        ] as any);

        const result = await budgetService.getUserSpending('trip-1', 'user-1');

        expect(convertCurrency).not.toHaveBeenCalled();
        expect(result.userSpending).toBe(80);
        expect(result.currency).toBe('USD');
    });

    it('converts foreign-currency splits to budget currency', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({ id: 'b1', currency: 'USD' } as any);
        vi.mocked(prisma.tripMember.findFirst).mockResolvedValue({ id: 'm1' } as any);
        vi.mocked(prisma.expenseSplit.findMany).mockResolvedValue([
            { share: 100, expense: { currency: 'EUR' } },
        ] as any);
        vi.mocked(convertCurrency).mockResolvedValueOnce(110 as any);

        const result = await budgetService.getUserSpending('trip-1', 'user-1');

        expect(convertCurrency).toHaveBeenCalledWith('EUR', 'USD', 100);
        expect(result.userSpending).toBe(110);
    });

    it('returns 0 when user has no expense splits', async () => {
        vi.mocked(prisma.budget.findUnique).mockResolvedValue({ id: 'b1', currency: 'USD' } as any);
        vi.mocked(prisma.tripMember.findFirst).mockResolvedValue({ id: 'm1' } as any);
        vi.mocked(prisma.expenseSplit.findMany).mockResolvedValue([] as any);

        const result = await budgetService.getUserSpending('trip-1', 'user-1');

        expect(result.userSpending).toBe(0);
    });
});
