import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTripStore } from '@/stores/tripStore';
import type { Trip } from '@/types/trip';
import type { Flight } from '@/pages/flights/services/api';
import type { Lodging } from '@/pages/lodging/services/api';

vi.mock('@/pages/flights/services/api', () => ({
  flightsApi: { getAll: vi.fn() },
}));

vi.mock('@/pages/lodging/services/api', () => ({
  lodgingsApi: { getAll: vi.fn() },
}));

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
}));

import { flightsApi } from '@/pages/flights/services/api';
import { lodgingsApi } from '@/pages/lodging/services/api';

const mockFlight = (id: string): Flight => ({
  id,
  tripId: 'trip-1',
  flightNumber: `FL${id}`,
  airline: 'TestAir',
  departure: '2024-07-01T10:00:00Z',
  arrival: '2024-07-01T14:00:00Z',
  from: 'TLV',
  to: 'CDG',
});

const mockLodging = (id: string): Lodging => ({
  id,
  tripId: 'trip-1',
  name: `Hotel ${id}`,
  address: '1 Test St',
  checkIn: '2024-07-01',
  checkOut: '2024-07-07',
});

const mockTrip: Trip = {
  id: 'trip-1',
  title: 'Paris Trip',
  destination: 'Paris',
  createdBy: 'user-1',
  image: null,
  members: [],
  latitude: 48.8566,
  longitude: 2.3522,
  itinerary: { id: 'itin-1' },
};

beforeEach(() => {
  useTripStore.getState().reset();
  vi.clearAllMocks();
});

describe('setTripData', () => {
  it('sets all trip fields from a Trip object', async () => {
    await useTripStore.getState().setTripData(mockTrip);
    const state = useTripStore.getState();
    expect(state.id).toBe('trip-1');
    expect(state.title).toBe('Paris Trip');
    expect(state.destination).toBe('Paris');
    expect(state.latitude).toBe(48.8566);
  });
});

describe('setDescription', () => {
  it('updates the description', () => {
    useTripStore.getState().setDescription('A lovely trip');
    expect(useTripStore.getState().description).toBe('A lovely trip');
  });
});

describe('setDestination', () => {
  it('updates the destination', () => {
    useTripStore.getState().setDestination('Rome');
    expect(useTripStore.getState().destination).toBe('Rome');
  });
});

describe('flight actions', () => {
  it('setFlights replaces the flights array', () => {
    useTripStore.getState().setFlights([mockFlight('f1'), mockFlight('f2')]);
    expect(useTripStore.getState().flights).toHaveLength(2);
  });

  it('addFlight appends a flight', () => {
    useTripStore.getState().addFlight(mockFlight('f1'));
    useTripStore.getState().addFlight(mockFlight('f2'));
    expect(useTripStore.getState().flights).toHaveLength(2);
    expect(useTripStore.getState().flights[1].id).toBe('f2');
  });

  it('updateFlight replaces the matching flight', () => {
    useTripStore.getState().setFlights([mockFlight('f1'), mockFlight('f2')]);
    const updated = { ...mockFlight('f1'), airline: 'NewAir' };
    useTripStore.getState().updateFlight('f1', updated);
    expect(useTripStore.getState().flights[0].airline).toBe('NewAir');
    expect(useTripStore.getState().flights).toHaveLength(2);
  });

  it('updateFlight does not affect other flights', () => {
    useTripStore.getState().setFlights([mockFlight('f1'), mockFlight('f2')]);
    useTripStore.getState().updateFlight('f1', { ...mockFlight('f1'), airline: 'NewAir' });
    expect(useTripStore.getState().flights[1].airline).toBe('TestAir');
  });

  it('deleteFlight removes the matching flight', () => {
    useTripStore.getState().setFlights([mockFlight('f1'), mockFlight('f2')]);
    useTripStore.getState().deleteFlight('f1');
    expect(useTripStore.getState().flights).toHaveLength(1);
    expect(useTripStore.getState().flights[0].id).toBe('f2');
  });
});

describe('lodging actions', () => {
  it('setLodgings replaces the lodgings array', () => {
    useTripStore.getState().setLodgings([mockLodging('l1'), mockLodging('l2')]);
    expect(useTripStore.getState().lodgings).toHaveLength(2);
  });

  it('addLodging appends a lodging', () => {
    useTripStore.getState().addLodging(mockLodging('l1'));
    useTripStore.getState().addLodging(mockLodging('l2'));
    expect(useTripStore.getState().lodgings).toHaveLength(2);
  });

  it('updateLodging replaces the matching lodging', () => {
    useTripStore.getState().setLodgings([mockLodging('l1'), mockLodging('l2')]);
    const updated = { ...mockLodging('l1'), name: 'Grand Hotel' };
    useTripStore.getState().updateLodging('l1', updated);
    expect(useTripStore.getState().lodgings[0].name).toBe('Grand Hotel');
    expect(useTripStore.getState().lodgings).toHaveLength(2);
  });

  it('deleteLodging removes the matching lodging', () => {
    useTripStore.getState().setLodgings([mockLodging('l1'), mockLodging('l2')]);
    useTripStore.getState().deleteLodging('l1');
    expect(useTripStore.getState().lodgings).toHaveLength(1);
    expect(useTripStore.getState().lodgings[0].id).toBe('l2');
  });
});

describe('fetchFlights', () => {
  it('sets flights from the API response', async () => {
    vi.mocked(flightsApi.getAll).mockResolvedValue({ data: [mockFlight('f1')] } as never);
    await useTripStore.getState().fetchFlights('trip-1');
    expect(useTripStore.getState().flights).toHaveLength(1);
    expect(useTripStore.getState().flights[0].id).toBe('f1');
  });

  it('shows a toast and does not throw on API error', async () => {
    const { toast } = await import('react-toastify');
    vi.mocked(flightsApi.getAll).mockRejectedValue(new Error('Network error'));
    await expect(useTripStore.getState().fetchFlights('trip-1')).resolves.toBeUndefined();
    expect(toast.error).toHaveBeenCalledOnce();
  });
});

describe('fetchLodgings', () => {
  it('sets lodgings from the API response', async () => {
    vi.mocked(lodgingsApi.getAll).mockResolvedValue({ data: [mockLodging('l1')] } as never);
    await useTripStore.getState().fetchLodgings('trip-1');
    expect(useTripStore.getState().lodgings).toHaveLength(1);
    expect(useTripStore.getState().lodgings[0].id).toBe('l1');
  });

  it('shows a toast and does not throw on API error', async () => {
    const { toast } = await import('react-toastify');
    vi.mocked(lodgingsApi.getAll).mockRejectedValue(new Error('Network error'));
    await expect(useTripStore.getState().fetchLodgings('trip-1')).resolves.toBeUndefined();
    expect(toast.error).toHaveBeenCalledOnce();
  });
});

describe('reset', () => {
  it('clears all state back to defaults', async () => {
    await useTripStore.getState().setTripData(mockTrip);
    useTripStore.getState().addFlight(mockFlight('f1'));
    useTripStore.getState().addLodging(mockLodging('l1'));

    useTripStore.getState().reset();

    const state = useTripStore.getState();
    expect(state.id).toBe('');
    expect(state.title).toBe('');
    expect(state.flights).toEqual([]);
    expect(state.lodgings).toEqual([]);
  });
});
