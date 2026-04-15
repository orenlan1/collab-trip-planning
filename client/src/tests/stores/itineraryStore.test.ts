import { describe, it, expect, beforeEach } from 'vitest';
import { useItineraryStore } from '@/stores/itineraryStore';
import type { Itinerary } from '@/types/itinerary';
import type { TripDay } from '@/types/tripDay';
import type { Activity } from '@/types/activity';

const makeDay = (id: string, date: Date, activities: Activity[] = []): TripDay => ({
  id,
  date,
  activities,
});

const makeActivity = (id: string): Activity => ({
  id,
  name: `Activity ${id}`,
  createdAt: new Date().toISOString(),
});

const mockItinerary: Itinerary = {
  id: 'itin-1',
  days: [
    makeDay('day-1', new Date('2024-07-01')),
    makeDay('day-2', new Date('2024-07-02')),
  ],
};

beforeEach(() => {
  useItineraryStore.getState().reset();
});

describe('setItineraryData', () => {
  it('sets the itinerary id and days', async () => {
    await useItineraryStore.getState().setItineraryData(mockItinerary);
    const state = useItineraryStore.getState();
    expect(state.id).toBe('itin-1');
    expect(state.days).toHaveLength(2);
  });
});

describe('setIsLoading', () => {
  it('sets isLoading to true', () => {
    useItineraryStore.getState().setIsLoading(true);
    expect(useItineraryStore.getState().isLoading).toBe(true);
  });

  it('sets isLoading to false', () => {
    useItineraryStore.getState().setIsLoading(true);
    useItineraryStore.getState().setIsLoading(false);
    expect(useItineraryStore.getState().isLoading).toBe(false);
  });
});

describe('setError', () => {
  it('sets an error message', () => {
    useItineraryStore.getState().setError('Something went wrong');
    expect(useItineraryStore.getState().error).toBe('Something went wrong');
  });

  it('clears the error with null', () => {
    useItineraryStore.getState().setError('err');
    useItineraryStore.getState().setError(null);
    expect(useItineraryStore.getState().error).toBeNull();
  });
});

describe('setActivities', () => {
  it('updates activities for the matching day', async () => {
    await useItineraryStore.getState().setItineraryData(mockItinerary);
    const day = useItineraryStore.getState().days[0];
    const activities = [makeActivity('act-1'), makeActivity('act-2')];

    useItineraryStore.getState().setActivities(day, activities);

    expect(useItineraryStore.getState().days[0].activities).toHaveLength(2);
  });

  it('does not modify other days', async () => {
    await useItineraryStore.getState().setItineraryData(mockItinerary);
    const day1 = useItineraryStore.getState().days[0];

    useItineraryStore.getState().setActivities(day1, [makeActivity('act-1')]);

    expect(useItineraryStore.getState().days[1].activities).toHaveLength(0);
  });
});

describe('selectDay', () => {
  it('sets selectedDayId', () => {
    useItineraryStore.getState().selectDay('day-3');
    expect(useItineraryStore.getState().selectedDayId).toBe('day-3');
  });

  it('overrides a previously selected day', () => {
    useItineraryStore.getState().selectDay('day-1');
    useItineraryStore.getState().selectDay('day-2');
    expect(useItineraryStore.getState().selectedDayId).toBe('day-2');
  });
});

describe('reset', () => {
  it('clears days, loading, error, and selectedDayId', async () => {
    await useItineraryStore.getState().setItineraryData(mockItinerary);
    useItineraryStore.getState().setIsLoading(true);
    useItineraryStore.getState().setError('oops');
    useItineraryStore.getState().selectDay('day-1');

    useItineraryStore.getState().reset();

    const state = useItineraryStore.getState();
    expect(state.days).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.selectedDayId).toBeNull();
  });
});
