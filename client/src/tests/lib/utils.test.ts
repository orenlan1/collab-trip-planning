import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isoStringToDate,
  dateToLocalDateString,
  formatTripFromAPI,
  formatTripDayFromAPI,
  formatItineraryFromAPI,
  getExcludedDates,
} from '@/lib/utils';
import type { Trip } from '@/types/trip';
import type { ApiTripDay } from '@/types/tripDay';
import type { ApiItinerary } from '@/types/itinerary';

// checkIfDateHasActivities uses the Zustand store — mock it at module level
vi.mock('@/stores/itineraryStore', () => ({
  useItineraryStore: {
    getState: () => ({ days: [] }),
  },
}));

describe('isoStringToDate', () => {
  it('returns null for null input', () => {
    expect(isoStringToDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(isoStringToDate(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(isoStringToDate('')).toBeNull();
  });

  it('parses a YYYY-MM-DD date string', () => {
    const result = isoStringToDate('2024-06-15');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2024);
    expect(result!.getMonth()).toBe(5); // June is month 5 (0-indexed)
    expect(result!.getDate()).toBe(15);
  });

  it('parses a full ISO string and uses only the date part', () => {
    const result = isoStringToDate('2024-06-15T10:30:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2024);
    expect(result!.getMonth()).toBe(5);
    expect(result!.getDate()).toBe(15);
  });

  it('returns null for an invalid format', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(isoStringToDate('not-a-date')).toBeNull();
    consoleSpy.mockRestore();
  });

  it('returns null for a partially valid string', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(isoStringToDate('2024/06/15')).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe('dateToLocalDateString', () => {
  it('formats a date to YYYY-MM-DD', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    expect(dateToLocalDateString(date)).toBe('2024-06-15');
  });

  it('pads single-digit month and day with zeros', () => {
    const date = new Date(2024, 0, 5); // January 5, 2024
    expect(dateToLocalDateString(date)).toBe('2024-01-05');
  });

  it('handles end of year', () => {
    const date = new Date(2023, 11, 31); // December 31, 2023
    expect(dateToLocalDateString(date)).toBe('2023-12-31');
  });
});

describe('formatTripFromAPI', () => {
  const baseTripFields = {
    id: 'trip-1',
    title: 'My Trip',
    destination: 'Paris',
    createdBy: 'user-1',
    image: null,
    members: [],
    latitude: null,
    longitude: null,
    itinerary: { id: 'itin-1' },
  };

  it('converts startDate and endDate ISO strings to Date objects', () => {
    const trip: Trip = {
      ...baseTripFields,
      startDate: '2024-07-01',
      endDate: '2024-07-10',
    };
    const result = formatTripFromAPI(trip);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it('returns null dates when startDate and endDate are absent', () => {
    const trip: Trip = { ...baseTripFields };
    const result = formatTripFromAPI(trip);
    expect(result.startDate).toBeNull();
    expect(result.endDate).toBeNull();
  });

  it('preserves all other trip fields', () => {
    const trip: Trip = { ...baseTripFields, startDate: '2024-07-01', endDate: '2024-07-10' };
    const result = formatTripFromAPI(trip);
    expect(result.id).toBe('trip-1');
    expect(result.title).toBe('My Trip');
    expect(result.destination).toBe('Paris');
  });
});

describe('formatTripDayFromAPI', () => {
  it('converts the date string to a Date object', () => {
    const tripDay: ApiTripDay = {
      id: 'day-1',
      itineraryId: 'itin-1',
      date: '2024-07-01',
      activities: [],
    };
    const result = formatTripDayFromAPI(tripDay);
    expect(result.date).toBeInstanceOf(Date);
  });

  it('preserves id, itineraryId, and activities', () => {
    const tripDay: ApiTripDay = {
      id: 'day-1',
      itineraryId: 'itin-1',
      date: '2024-07-01',
      activities: [],
    };
    const result = formatTripDayFromAPI(tripDay);
    expect(result.id).toBe('day-1');
    expect(result.itineraryId).toBe('itin-1');
    expect(result.activities).toEqual([]);
  });
});

describe('formatItineraryFromAPI', () => {
  it('converts all day dates to Date objects', () => {
    const itinerary: ApiItinerary = {
      id: 'itin-1',
      tripId: 'trip-1',
      days: [
        { id: 'day-1', itineraryId: 'itin-1', date: '2024-07-01', activities: [] },
        { id: 'day-2', itineraryId: 'itin-1', date: '2024-07-02', activities: [] },
      ],
    };
    const result = formatItineraryFromAPI(itinerary);
    expect(result.days).toHaveLength(2);
    expect(result.days[0].date).toBeInstanceOf(Date);
    expect(result.days[1].date).toBeInstanceOf(Date);
  });

  it('handles an itinerary with no days', () => {
    const itinerary: ApiItinerary = { id: 'itin-1', tripId: 'trip-1', days: [] };
    const result = formatItineraryFromAPI(itinerary);
    expect(result.days).toEqual([]);
  });
});

describe('getExcludedDates', () => {
  beforeEach(() => {
    // Use fixed dates to avoid timezone sensitivity
  });

  it('returns dates that fall outside the new range', () => {
    const currentStart = new Date(2024, 5, 1); // June 1
    const currentEnd = new Date(2024, 5, 10);  // June 10
    const newStart = new Date(2024, 5, 4);     // June 4
    const newEnd = new Date(2024, 5, 7);       // June 7

    const excluded = getExcludedDates(currentStart, currentEnd, newStart, newEnd);

    // June 1, 2, 3 are before newStart; June 8, 9, 10 are after newEnd
    expect(excluded).toHaveLength(6);
  });

  it('returns empty array when new range covers the full current range', () => {
    const currentStart = new Date(2024, 5, 3);
    const currentEnd = new Date(2024, 5, 7);
    const newStart = new Date(2024, 5, 1);
    const newEnd = new Date(2024, 5, 10);

    const excluded = getExcludedDates(currentStart, currentEnd, newStart, newEnd);
    expect(excluded).toHaveLength(0);
  });

  it('returns all dates when new range does not overlap', () => {
    const currentStart = new Date(2024, 5, 1);
    const currentEnd = new Date(2024, 5, 5);
    const newStart = new Date(2024, 6, 1);
    const newEnd = new Date(2024, 6, 5);

    const excluded = getExcludedDates(currentStart, currentEnd, newStart, newEnd);
    expect(excluded).toHaveLength(5); // June 1–5 are all excluded
  });
});
