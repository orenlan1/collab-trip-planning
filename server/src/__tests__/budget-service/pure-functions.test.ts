import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aggregateExpensesByCategoryWithConversion } from '../../services/budget-service.js';
import { convertCurrency } from '../../apiClients/unirate/unirate.js';

vi.mock('../../apiClients/unirate/unirate.js', () => ({
    convertCurrency: vi.fn(),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('aggregateExpensesByCategoryWithConversion', () => {
    describe('same-currency expenses — no conversion needed', () => {
        it('sums expenses in the same currency without calling convertCurrency', async () => {
            const result = await aggregateExpensesByCategoryWithConversion(
                [
                    { category: 'FOOD', cost: 100, currency: 'USD' },
                    { category: 'FOOD', cost: 50, currency: 'USD' },
                    { category: 'TRANSPORTATION', cost: 200, currency: 'USD' },
                ],
                'USD'
            );

            expect(convertCurrency).not.toHaveBeenCalled();
            expect(result.FOOD).toBe(150);
            expect(result.TRANSPORTATION).toBe(200);
        });

        it('initialises all categories to 0 when there are no expenses', async () => {
            const result = await aggregateExpensesByCategoryWithConversion([], 'EUR');

            expect(convertCurrency).not.toHaveBeenCalled();
            expect(result.FOOD).toBe(0);
            expect(result.TRANSPORTATION).toBe(0);
            expect(result.ACCOMMODATION).toBe(0);
            expect(result.ACTIVITIES).toBe(0);
            expect(result.MISCELLANEOUS).toBe(0);
        });
    });

    describe('multi-currency expenses — conversion', () => {
        it('converts each unique foreign currency with exactly one API call per currency', async () => {
            vi.mocked(convertCurrency)
                .mockResolvedValueOnce({ result: 1.1 })  // EUR→USD
                .mockResolvedValueOnce({ result: 1.3 }); // GBP→USD

            const result = await aggregateExpensesByCategoryWithConversion(
                [
                    { category: 'FOOD', cost: 100, currency: 'EUR' },
                    { category: 'ACCOMMODATION', cost: 200, currency: 'EUR' },
                    { category: 'ACTIVITIES', cost: 50, currency: 'GBP' },
                ],
                'USD'
            );

            expect(convertCurrency).toHaveBeenCalledTimes(2);
            expect(convertCurrency).toHaveBeenCalledWith('EUR', 'USD', 1);
            expect(convertCurrency).toHaveBeenCalledWith('GBP', 'USD', 1);
            expect(result.FOOD).toBeCloseTo(110);         // 100 * 1.1
            expect(result.ACCOMMODATION).toBeCloseTo(220); // 200 * 1.1
            expect(result.ACTIVITIES).toBeCloseTo(65);    // 50 * 1.3
        });

        it('batches multiple expenses of the same foreign currency into one API call', async () => {
            vi.mocked(convertCurrency).mockResolvedValueOnce({ result: 1.1 });

            const result = await aggregateExpensesByCategoryWithConversion(
                [
                    { category: 'FOOD', cost: 50, currency: 'EUR' },
                    { category: 'FOOD', cost: 80, currency: 'EUR' },
                    { category: 'TRANSPORTATION', cost: 30, currency: 'EUR' },
                ],
                'USD'
            );

            expect(convertCurrency).toHaveBeenCalledTimes(1);
            expect(result.FOOD).toBeCloseTo(143);         // (50 + 80) * 1.1
            expect(result.TRANSPORTATION).toBeCloseTo(33); // 30 * 1.1
        });

        it('handles a mix of target-currency and foreign-currency expenses', async () => {
            vi.mocked(convertCurrency).mockResolvedValueOnce({ result: 1.1 });

            const result = await aggregateExpensesByCategoryWithConversion(
                [
                    { category: 'FOOD', cost: 100, currency: 'USD' },
                    { category: 'FOOD', cost: 50, currency: 'EUR' },
                ],
                'USD'
            );

            expect(convertCurrency).toHaveBeenCalledTimes(1);
            expect(result.FOOD).toBeCloseTo(155); // 100 + (50 * 1.1)
        });
    });

    describe('conversion API failure — graceful fallback', () => {
        it('falls back to original amounts when convertCurrency throws', async () => {
            vi.mocked(convertCurrency).mockRejectedValueOnce(new Error('API error'));

            const result = await aggregateExpensesByCategoryWithConversion(
                [{ category: 'FOOD', cost: 100, currency: 'EUR' }],
                'USD'
            );

            expect(result.FOOD).toBe(100);
        });
    });

    describe('edge cases', () => {
        it('handles fractional conversion rates without losing precision significantly', async () => {
            vi.mocked(convertCurrency).mockResolvedValueOnce({ result: 1.23456789 });

            const result = await aggregateExpensesByCategoryWithConversion(
                [{ category: 'FOOD', cost: 10, currency: 'EUR' }],
                'USD'
            );

            expect(result.FOOD).toBeCloseTo(12.3456789);
        });

        it('handles zero-cost expense without calling convertCurrency', async () => {
            const result = await aggregateExpensesByCategoryWithConversion(
                [{ category: 'FOOD', cost: 0, currency: 'USD' }],
                'USD'
            );

            expect(convertCurrency).not.toHaveBeenCalled();
            expect(result.FOOD).toBe(0);
        });

        it('spreads expenses correctly across all five categories', async () => {
            const result = await aggregateExpensesByCategoryWithConversion(
                [
                    { category: 'TRANSPORTATION', cost: 10, currency: 'USD' },
                    { category: 'ACCOMMODATION', cost: 20, currency: 'USD' },
                    { category: 'ACTIVITIES', cost: 30, currency: 'USD' },
                    { category: 'FOOD', cost: 40, currency: 'USD' },
                    { category: 'MISCELLANEOUS', cost: 50, currency: 'USD' },
                ],
                'USD'
            );

            expect(result.TRANSPORTATION).toBe(10);
            expect(result.ACCOMMODATION).toBe(20);
            expect(result.ACTIVITIES).toBe(30);
            expect(result.FOOD).toBe(40);
            expect(result.MISCELLANEOUS).toBe(50);
        });
    });
});
