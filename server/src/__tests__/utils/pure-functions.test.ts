import { describe, it, expect } from 'vitest';
import {
  getExcludedDates,
  normalizeDate,
  dateToISOString,
  formatTripForAPI,
  formatTripDayForAPI,
} from '../../lib/utils.js';

// ─── getExcludedDates ─────────────────────────────────────────────────────────

describe('getExcludedDates', () => {
  it('returns empty array when new range equals the current range', () => {
    const start = new Date('2024-06-01T00:00:00.000Z');
    const end = new Date('2024-06-05T00:00:00.000Z');

    const result = getExcludedDates(start, end, start, end);

    expect(result).toHaveLength(0);
  });

  it('excludes dates before the new start date when range shrinks from the left', () => {
    const currentStart = new Date('2024-06-01T00:00:00.000Z');
    const currentEnd = new Date('2024-06-05T00:00:00.000Z');
    const newStart = new Date('2024-06-03T00:00:00.000Z');
    const newEnd = new Date('2024-06-05T00:00:00.000Z');

    const result = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    expect(result).toHaveLength(2);
    expect(result[0]!.toISOString()).toBe('2024-06-01T00:00:00.000Z');
    expect(result[1]!.toISOString()).toBe('2024-06-02T00:00:00.000Z');
  });

  it('excludes dates after the new end date when range shrinks from the right', () => {
    const currentStart = new Date('2024-06-01T00:00:00.000Z');
    const currentEnd = new Date('2024-06-05T00:00:00.000Z');
    const newStart = new Date('2024-06-01T00:00:00.000Z');
    const newEnd = new Date('2024-06-03T00:00:00.000Z');

    const result = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    expect(result).toHaveLength(2);
    expect(result[0]!.toISOString()).toBe('2024-06-04T00:00:00.000Z');
    expect(result[1]!.toISOString()).toBe('2024-06-05T00:00:00.000Z');
  });

  it('excludes dates on both ends when range shrinks from both sides', () => {
    const currentStart = new Date('2024-06-01T00:00:00.000Z');
    const currentEnd = new Date('2024-06-07T00:00:00.000Z');
    const newStart = new Date('2024-06-03T00:00:00.000Z');
    const newEnd = new Date('2024-06-05T00:00:00.000Z');

    const result = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    // Jun 1, 2 (before) + Jun 6, 7 (after) = 4 excluded
    expect(result).toHaveLength(4);
    const isoStrings = result.map(d => d.toISOString().split('T')[0]);
    expect(isoStrings).toContain('2024-06-01');
    expect(isoStrings).toContain('2024-06-02');
    expect(isoStrings).toContain('2024-06-06');
    expect(isoStrings).toContain('2024-06-07');
  });

  it('returns all current dates when new range does not overlap at all', () => {
    const currentStart = new Date('2024-06-01T00:00:00.000Z');
    const currentEnd = new Date('2024-06-03T00:00:00.000Z');
    const newStart = new Date('2024-07-01T00:00:00.000Z');
    const newEnd = new Date('2024-07-05T00:00:00.000Z');

    const result = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    // All 3 current dates are excluded (they're all before the new range)
    expect(result).toHaveLength(3);
  });

  it('returns empty array when range is expanded (no days are removed)', () => {
    const currentStart = new Date('2024-06-02T00:00:00.000Z');
    const currentEnd = new Date('2024-06-04T00:00:00.000Z');
    const newStart = new Date('2024-06-01T00:00:00.000Z');
    const newEnd = new Date('2024-06-05T00:00:00.000Z');

    const result = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    expect(result).toHaveLength(0);
  });
});

// ─── dateToISOString ─────────────────────────────────────────────────────────

describe('dateToISOString', () => {
  it('returns null for null input', () => {
    expect(dateToISOString(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(dateToISOString(undefined)).toBeNull();
  });

  it('returns the date portion only (YYYY-MM-DD format)', () => {
    const date = new Date('2024-06-15T12:30:00.000Z');
    expect(dateToISOString(date)).toBe('2024-06-15');
  });

  it('normalizes a midnight UTC date correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(dateToISOString(date)).toBe('2024-01-01');
  });

  it('strips the time component from dates with arbitrary times', () => {
    const date = new Date('2024-12-31T23:59:59.999Z');
    expect(dateToISOString(date)).toBe('2024-12-31');
  });
});

// ─── normalizeDate ────────────────────────────────────────────────────────────

describe('normalizeDate', () => {
  it('returns null for null input', () => {
    expect(normalizeDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(normalizeDate(undefined)).toBeNull();
  });

  it('parses a plain YYYY-MM-DD string to UTC midnight', () => {
    const result = normalizeDate('2024-06-15');
    expect(result).not.toBeNull();
    expect(result!.toISOString()).toBe('2024-06-15T00:00:00.000Z');
  });

  it('extracts date part from an ISO datetime string', () => {
    const result = normalizeDate('2024-06-15T14:30:00.000Z');
    expect(result).not.toBeNull();
    expect(result!.toISOString()).toBe('2024-06-15T00:00:00.000Z');
  });

  it('converts a Date object to UTC midnight', () => {
    const input = new Date('2024-06-15T22:00:00.000Z');
    const result = normalizeDate(input);
    expect(result).not.toBeNull();
    expect(result!.toISOString()).toBe('2024-06-15T00:00:00.000Z');
  });

  it('throws for a non-date string', () => {
    expect(() => normalizeDate('not-a-date')).toThrow('Invalid date format');
  });

  it('throws for a partial date string', () => {
    expect(() => normalizeDate('2024-06')).toThrow('Invalid date format');
  });
});

// ─── formatTripForAPI ─────────────────────────────────────────────────────────

describe('formatTripForAPI', () => {
  it('converts startDate and endDate Date objects to ISO date strings', () => {
    const trip = {
      id: 'trip-1',
      title: 'Paris',
      startDate: new Date('2024-06-01T00:00:00.000Z'),
      endDate: new Date('2024-06-10T00:00:00.000Z'),
    };

    const result = formatTripForAPI(trip);

    expect(result.startDate).toBe('2024-06-01');
    expect(result.endDate).toBe('2024-06-10');
  });

  it('preserves null startDate and endDate', () => {
    const trip = { id: 'trip-1', title: 'Paris', startDate: null, endDate: null };

    const result = formatTripForAPI(trip);

    expect(result.startDate).toBeNull();
    expect(result.endDate).toBeNull();
  });

  it('preserves all other trip fields unchanged', () => {
    const trip = {
      id: 'trip-1',
      title: 'Paris',
      destination: 'France',
      startDate: null,
      endDate: null,
    };

    const result = formatTripForAPI(trip);

    expect(result.id).toBe('trip-1');
    expect(result.title).toBe('Paris');
    expect(result.destination).toBe('France');
  });
});

// ─── formatTripDayForAPI ──────────────────────────────────────────────────────

describe('formatTripDayForAPI', () => {
  it('converts the date field from a Date object to an ISO date string', () => {
    const tripDay = {
      id: 'day-1',
      itineraryId: 'itin-1',
      date: new Date('2024-06-05T00:00:00.000Z'),
    };

    const result = formatTripDayForAPI(tripDay);

    expect(result.date).toBe('2024-06-05');
  });

  it('returns null date when date is null', () => {
    const tripDay = { id: 'day-1', itineraryId: 'itin-1', date: null };

    const result = formatTripDayForAPI(tripDay);

    expect(result.date).toBeNull();
  });

  it('preserves all other trip day fields unchanged', () => {
    const tripDay = {
      id: 'day-1',
      itineraryId: 'itin-1',
      date: new Date('2024-06-05T00:00:00.000Z'),
      activities: [],
    };

    const result = formatTripDayForAPI(tripDay);

    expect(result.id).toBe('day-1');
    expect(result.itineraryId).toBe('itin-1');
    expect(result.activities).toEqual([]);
  });
});
