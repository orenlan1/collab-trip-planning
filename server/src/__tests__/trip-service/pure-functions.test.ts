import { describe, it, expect } from 'vitest';
import { generateDateRange } from '../../services/trip-service.js';

describe('generateDateRange', () => {
  describe('valid ranges', () => {
    it('returns a single date when start and end are the same day', () => {
      const date = new Date('2024-06-15T00:00:00.000Z');
      const result = generateDateRange(date, date);

      expect(result).toHaveLength(1);
      expect(result[0]!.toISOString()).toBe('2024-06-15T00:00:00.000Z');
    });

    it('returns correct dates for a multi-day range', () => {
      const start = new Date('2024-06-01T00:00:00.000Z');
      const end = new Date('2024-06-03T00:00:00.000Z');
      const result = generateDateRange(start, end);

      expect(result).toHaveLength(3);
      expect(result[0]!.toISOString()).toBe('2024-06-01T00:00:00.000Z');
      expect(result[1]!.toISOString()).toBe('2024-06-02T00:00:00.000Z');
      expect(result[2]!.toISOString()).toBe('2024-06-03T00:00:00.000Z');
    });

    it('normalizes all dates to midnight UTC', () => {
      const start = new Date('2024-06-01T15:30:00.000Z');
      const end = new Date('2024-06-02T09:45:00.000Z');
      const result = generateDateRange(start, end);

      for (const date of result) {
        expect(date.toISOString()).toMatch(/T00:00:00\.000Z$/);
      }
    });

    it('handles month boundaries correctly', () => {
      const start = new Date('2024-01-30T00:00:00.000Z');
      const end = new Date('2024-02-02T00:00:00.000Z');
      const result = generateDateRange(start, end);

      expect(result).toHaveLength(4);
      expect(result.map(d => d.toISOString().split('T')[0])).toEqual([
        '2024-01-30',
        '2024-01-31',
        '2024-02-01',
        '2024-02-02',
      ]);
    });

    it('accepts a range of 364 days (under the limit)', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-12-29T00:00:00.000Z'); // 364 days inclusive
      const result = generateDateRange(start, end);

      expect(result).toHaveLength(364);
    });
  });

  describe('invalid ranges', () => {
    it('throws when end date is before start date', () => {
      const start = new Date('2024-06-10T00:00:00.000Z');
      const end = new Date('2024-06-01T00:00:00.000Z');

      expect(() => generateDateRange(start, end)).toThrow(
        'End date must be after start date'
      );
    });

    it('throws when range meets the 365-day maximum', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-12-31T00:00:00.000Z'); // 366 dates inclusive (2024 is leap year)

      expect(() => generateDateRange(start, end)).toThrow(
        'Trip duration exceeds maximum allowed length of 365 days'
      );
    });
  });
});
