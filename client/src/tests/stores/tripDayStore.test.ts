import { describe, it, expect, beforeEach } from 'vitest';
import { useTripDayStore } from '@/stores/tripDayStore';
import type { TripDay } from '@/types/tripDay';
import type { Activity } from '@/types/activity';
import type { Expense } from '@/types/expense';

const makeActivity = (id: string, startTime?: string, createdAt?: string): Activity => ({
  id,
  name: `Activity ${id}`,
  startTime,
  createdAt: createdAt ?? '2024-07-01T08:00:00.000Z',
});

const mockExpense: Expense = {
  id: 'exp-1',
  description: 'Dinner',
  cost: 50,
  currency: 'USD',
  category: 'Food',
  date: '2024-07-01',
  createdAt: '2024-07-01T20:00:00Z',
  updatedAt: '2024-07-01T20:00:00Z',
};

const mockTripDay: TripDay = {
  id: 'day-1',
  date: new Date('2024-07-01'),
  activities: [],
};

beforeEach(() => {
  useTripDayStore.setState({ tripDay: null });
});

describe('setTripDay', () => {
  it('sets the tripDay', () => {
    useTripDayStore.getState().setTripDay(mockTripDay);
    expect(useTripDayStore.getState().tripDay?.id).toBe('day-1');
  });

  it('clears the tripDay when called with null', () => {
    useTripDayStore.getState().setTripDay(mockTripDay);
    useTripDayStore.getState().setTripDay(null);
    expect(useTripDayStore.getState().tripDay).toBeNull();
  });
});

describe('addActivity', () => {
  beforeEach(() => {
    useTripDayStore.getState().setTripDay(mockTripDay);
  });

  it('appends an activity to the day', () => {
    useTripDayStore.getState().addActivity(makeActivity('a1'));
    expect(useTripDayStore.getState().tripDay?.activities).toHaveLength(1);
  });

  it('places activities without startTime before those with startTime', () => {
    useTripDayStore.getState().addActivity(makeActivity('a1', '2024-07-01T12:00:00Z'));
    useTripDayStore.getState().addActivity(makeActivity('a2')); // no startTime

    const ids = useTripDayStore.getState().tripDay!.activities.map(a => a.id);
    expect(ids[0]).toBe('a2'); // no startTime comes first
    expect(ids[1]).toBe('a1');
  });

  it('sorts multiple timed activities by startTime', () => {
    useTripDayStore.getState().addActivity(makeActivity('a1', '2024-07-01T14:00:00Z'));
    useTripDayStore.getState().addActivity(makeActivity('a2', '2024-07-01T09:00:00Z'));
    useTripDayStore.getState().addActivity(makeActivity('a3', '2024-07-01T11:00:00Z'));

    const ids = useTripDayStore.getState().tripDay!.activities.map(a => a.id);
    expect(ids).toEqual(['a2', 'a3', 'a1']);
  });

  it('sorts untimed activities among themselves by createdAt', () => {
    useTripDayStore.getState().addActivity(makeActivity('a1', undefined, '2024-07-01T10:00:00.000Z'));
    useTripDayStore.getState().addActivity(makeActivity('a2', undefined, '2024-07-01T08:00:00.000Z'));

    const ids = useTripDayStore.getState().tripDay!.activities.map(a => a.id);
    expect(ids[0]).toBe('a2'); // earlier createdAt comes first
    expect(ids[1]).toBe('a1');
  });

  it('does nothing when tripDay is null', () => {
    useTripDayStore.setState({ tripDay: null });
    useTripDayStore.getState().addActivity(makeActivity('a1'));
    expect(useTripDayStore.getState().tripDay).toBeNull();
  });
});

describe('removeActivity', () => {
  beforeEach(() => {
    useTripDayStore.getState().setTripDay({
      ...mockTripDay,
      activities: [makeActivity('a1'), makeActivity('a2'), makeActivity('a3')],
    });
  });

  it('removes the activity with the matching id', () => {
    useTripDayStore.getState().removeActivity('a2');
    const ids = useTripDayStore.getState().tripDay!.activities.map(a => a.id);
    expect(ids).toEqual(['a1', 'a3']);
  });

  it('does nothing when tripDay is null', () => {
    useTripDayStore.setState({ tripDay: null });
    useTripDayStore.getState().removeActivity('a1');
    expect(useTripDayStore.getState().tripDay).toBeNull();
  });
});

describe('updateActivity', () => {
  beforeEach(() => {
    useTripDayStore.getState().setTripDay({
      ...mockTripDay,
      activities: [makeActivity('a1'), makeActivity('a2')],
    });
  });

  it('replaces the matching activity', () => {
    const updated = makeActivity('a1', undefined, '2024-07-01T08:00:00.000Z');
    updated.name = 'Updated name';
    useTripDayStore.getState().updateActivity('a1', updated);

    const activity = useTripDayStore.getState().tripDay!.activities.find(a => a.id === 'a1');
    expect(activity?.name).toBe('Updated name');
  });

  it('re-sorts after update when startTime changes', () => {
    // a1 gets a late startTime, a2 gets an early startTime
    useTripDayStore.getState().updateActivity('a1', makeActivity('a1', '2024-07-01T15:00:00Z'));
    useTripDayStore.getState().updateActivity('a2', makeActivity('a2', '2024-07-01T09:00:00Z'));

    const ids = useTripDayStore.getState().tripDay!.activities.map(a => a.id);
    expect(ids[0]).toBe('a2');
    expect(ids[1]).toBe('a1');
  });

  it('does nothing when tripDay is null', () => {
    useTripDayStore.setState({ tripDay: null });
    useTripDayStore.getState().updateActivity('a1', makeActivity('a1'));
    expect(useTripDayStore.getState().tripDay).toBeNull();
  });
});

describe('updateActivityExpense', () => {
  beforeEach(() => {
    useTripDayStore.getState().setTripDay({
      ...mockTripDay,
      activities: [makeActivity('a1'), makeActivity('a2')],
    });
  });

  it('sets the expense on the matching activity', () => {
    useTripDayStore.getState().updateActivityExpense('a1', mockExpense);
    const activity = useTripDayStore.getState().tripDay!.activities.find(a => a.id === 'a1');
    expect(activity?.expense?.id).toBe('exp-1');
  });

  it('clears the expense when set to null', () => {
    useTripDayStore.getState().updateActivityExpense('a1', mockExpense);
    useTripDayStore.getState().updateActivityExpense('a1', null);
    const activity = useTripDayStore.getState().tripDay!.activities.find(a => a.id === 'a1');
    expect(activity?.expense).toBeNull();
  });

  it('does not modify other activities', () => {
    useTripDayStore.getState().updateActivityExpense('a1', mockExpense);
    const other = useTripDayStore.getState().tripDay!.activities.find(a => a.id === 'a2');
    expect(other?.expense).toBeUndefined();
  });

  it('does nothing when tripDay is null', () => {
    useTripDayStore.setState({ tripDay: null });
    useTripDayStore.getState().updateActivityExpense('a1', mockExpense);
    expect(useTripDayStore.getState().tripDay).toBeNull();
  });
});
