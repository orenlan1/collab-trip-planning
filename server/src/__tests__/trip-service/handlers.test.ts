import { describe, it, expect, vi, beforeEach } from 'vitest';
import tripService from '../../services/trip-service.js';
import { prisma } from '../../prisma/client.js';
import { fetchImageURL } from '../../apiClients/unsplash/images.js';
import { destinationService } from '../../services/destination-service.js';
import itineraryService from '../../services/itinerary-service.js';

vi.mock('../../prisma/client.js', () => ({
  prisma: {
    trip: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    invitation: { create: vi.fn() },
    tripDay: { createMany: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../apiClients/unsplash/images.js', () => ({
  fetchImageURL: vi.fn(),
}));

vi.mock('../../services/destination-service.js', () => ({
  destinationService: { getDestinationLatLng: vi.fn() },
}));

vi.mock('../../services/itinerary-service.js', () => ({
  default: { createItineraryDays: vi.fn() },
}));

// Reusable mock tx for $transaction tests
const mockTx = {
  trip: { findUnique: vi.fn(), update: vi.fn() },
  tripDay: { createMany: vi.fn(), deleteMany: vi.fn() },
};

const makeTrip = (overrides = {}) => ({
  id: 'trip-1',
  title: 'Paris Trip',
  destination: 'Paris',
  description: null,
  startDate: null,
  endDate: null,
  latitude: null,
  longitude: null,
  image: null,
  createdById: 'user-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  members: [],
  itinerary: { id: 'itin-1' },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx));
});

// ─── getTripById ─────────────────────────────────────────────────────────────

describe('getTripById', () => {
  it('returns null when trip does not exist', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(null);

    const result = await tripService.getTripById('nonexistent-id');

    expect(result).toBeNull();
  });

  it('returns a formatted trip when found', async () => {
    const trip = makeTrip({
      startDate: new Date('2024-06-01T00:00:00.000Z'),
      endDate: new Date('2024-06-10T00:00:00.000Z'),
    });
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(trip as any);

    const result = await tripService.getTripById('trip-1');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('trip-1');
    // formatTripForAPI converts Date → ISO string
    expect(result!.startDate).toBe('2024-06-01');
    expect(result!.endDate).toBe('2024-06-10');
  });

  it('returns trip with null dates when trip has no scheduled dates', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(makeTrip() as any);

    const result = await tripService.getTripById('trip-1');

    expect(result!.startDate).toBeNull();
    expect(result!.endDate).toBeNull();
  });
});

// ─── getAllTripsByUserId ──────────────────────────────────────────────────────

describe('getAllTripsByUserId', () => {
  it('returns empty array when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await tripService.getAllTripsByUserId('nonexistent-user');

    expect(result).toEqual([]);
  });

  it('returns empty array when user has no memberships', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      memberships: [],
    } as any);

    const result = await tripService.getAllTripsByUserId('user-1');

    expect(result).toEqual([]);
  });

  it('returns formatted trips for all memberships', async () => {
    const trip = makeTrip({
      startDate: new Date('2024-06-01T00:00:00.000Z'),
      endDate: new Date('2024-06-10T00:00:00.000Z'),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      memberships: [{ trip }],
    } as any);

    const result = await tripService.getAllTripsByUserId('user-1');

    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('trip-1');
    expect(result[0]!.startDate).toBe('2024-06-01');
  });
});

// ─── inviteUser ───────────────────────────────────────────────────────────────

describe('inviteUser', () => {
  it('throws when trip does not exist', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(null);

    await expect(
      tripService.inviteUser('bad-trip', 'user@test.com', 'inviter-1')
    ).rejects.toThrow('Trip not found');
  });

  it('throws when invited user email does not exist', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(makeTrip() as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      tripService.inviteUser('trip-1', 'ghost@test.com', 'inviter-1')
    ).rejects.toThrow('Invited user not found');
  });

  it('throws when invited user is already a trip member', async () => {
    const invitedUser = { id: 'user-2', email: 'user@test.com' };
    const trip = makeTrip({ members: [{ userId: 'user-2' }] });
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(trip as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(invitedUser as any);

    await expect(
      tripService.inviteUser('trip-1', 'user@test.com', 'inviter-1')
    ).rejects.toThrow('User is already a member of this trip');
  });

  it('creates and returns the invitation when valid', async () => {
    const invitedUser = { id: 'user-2', email: 'user@test.com' };
    const trip = makeTrip({ members: [] });
    const invitation = { id: 'inv-1', tripId: 'trip-1', invitedUserId: 'user-2', inviterUserId: 'inviter-1' };
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(trip as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(invitedUser as any);
    vi.mocked(prisma.invitation.create).mockResolvedValue(invitation as any);

    const result = await tripService.inviteUser('trip-1', 'user@test.com', 'inviter-1');

    expect(result).toEqual(invitation);
    expect(prisma.invitation.create).toHaveBeenCalledWith({
      data: { tripId: 'trip-1', invitedUserId: 'user-2', inviterUserId: 'inviter-1' },
    });
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('create', () => {
  it('fetches location and image when destination is provided', async () => {
    const trip = makeTrip({ destination: 'Tokyo' });
    vi.mocked(prisma.trip.create).mockResolvedValue(trip as any);
    vi.mocked(destinationService.getDestinationLatLng).mockResolvedValue({
      latitude: 35.6762,
      longitude: 139.6503,
    });
    vi.mocked(fetchImageURL).mockResolvedValue('https://image.url/tokyo.jpg');

    await tripService.create({ title: 'Tokyo Trip', destination: 'Tokyo' } as any, 'user-1');

    expect(destinationService.getDestinationLatLng).toHaveBeenCalledWith('Tokyo');
    expect(fetchImageURL).toHaveBeenCalledWith('Tokyo', 'regular');
  });

  it('skips itinerary day creation when no dates are provided', async () => {
    const trip = makeTrip();
    vi.mocked(prisma.trip.create).mockResolvedValue(trip as any);

    await tripService.create({ title: 'No Dates Trip' } as any, 'user-1');

    expect(itineraryService.createItineraryDays).not.toHaveBeenCalled();
  });

  it('creates itinerary days when both start and end dates are provided', async () => {
    const trip = makeTrip({
      startDate: new Date('2024-06-01T00:00:00.000Z'),
      endDate: new Date('2024-06-05T00:00:00.000Z'),
    });
    vi.mocked(prisma.trip.create).mockResolvedValue(trip as any);

    await tripService.create(
      {
        title: 'Dated Trip',
        startDate: new Date('2024-06-01T00:00:00.000Z'),
        endDate: new Date('2024-06-05T00:00:00.000Z'),
      } as any,
      'user-1'
    );

    expect(itineraryService.createItineraryDays).toHaveBeenCalledWith(
      'itin-1',
      expect.any(Date),
      expect.any(Date)
    );
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('update', () => {
  it('throws when trip does not exist', async () => {
    mockTx.trip.findUnique.mockResolvedValue(null);

    await expect(
      tripService.update('bad-trip', { title: 'New Title' } as any)
    ).rejects.toThrow('Trip not found');
  });

  it('updates non-date fields without touching trip days', async () => {
    const trip = makeTrip({ title: 'Old Title' });
    mockTx.trip.findUnique.mockResolvedValue({
      ...trip,
      itinerary: { ...trip.itinerary, days: [] },
    });
    mockTx.trip.update.mockResolvedValue({ ...trip, title: 'New Title' });

    await tripService.update('trip-1', { title: 'New Title' } as any);

    expect(mockTx.tripDay.createMany).not.toHaveBeenCalled();
    expect(mockTx.tripDay.deleteMany).not.toHaveBeenCalled();
    expect(mockTx.trip.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'trip-1' },
        data: expect.objectContaining({ title: 'New Title' }),
      })
    );
  });

  describe('Case 1 — initial date setting (trip had no dates)', () => {
    it('creates trip days for the full new date range', async () => {
      const trip = makeTrip(); // no startDate/endDate
      mockTx.trip.findUnique.mockResolvedValue({
        ...trip,
        itinerary: { id: 'itin-1', days: [] },
      });
      mockTx.trip.update.mockResolvedValue(trip);

      await tripService.update('trip-1', {
        startDate: new Date('2024-06-01T00:00:00.000Z'),
        endDate: new Date('2024-06-03T00:00:00.000Z'),
      });

      expect(mockTx.tripDay.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ itineraryId: 'itin-1' }),
        ]),
      });
      // 3 days: Jun 1, 2, 3
      const callArg = mockTx.tripDay.createMany.mock.calls[0]![0];
      expect(callArg.data).toHaveLength(3);
    });

    it('throws when itinerary is missing on initial date set', async () => {
      mockTx.trip.findUnique.mockResolvedValue({
        ...makeTrip(),
        itinerary: null,
      });

      await expect(
        tripService.update('trip-1', {
          startDate: new Date('2024-06-01T00:00:00.000Z'),
          endDate: new Date('2024-06-03T00:00:00.000Z'),
        })
      ).rejects.toThrow('Trip itinerary not found');
    });
  });

  describe('Case 2 — date range modification (trip already had dates)', () => {
    it('deletes days that fall outside the new shorter range', async () => {
      const existingDays = [
        { id: 'day-1', date: new Date('2024-06-01T00:00:00.000Z') },
        { id: 'day-2', date: new Date('2024-06-02T00:00:00.000Z') },
        { id: 'day-3', date: new Date('2024-06-03T00:00:00.000Z') },
      ];
      mockTx.trip.findUnique.mockResolvedValue({
        ...makeTrip({
          startDate: new Date('2024-06-01T00:00:00.000Z'),
          endDate: new Date('2024-06-03T00:00:00.000Z'),
        }),
        itinerary: { id: 'itin-1', days: existingDays },
      });
      mockTx.trip.update.mockResolvedValue(makeTrip());

      // Shrink: new range is Jun 1–2 only
      await tripService.update('trip-1', {
        endDate: new Date('2024-06-02T00:00:00.000Z'),
      } as any);

      expect(mockTx.tripDay.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['day-3'] } },
      });
    });

    it('creates new days when range expands', async () => {
      const existingDays = [
        { id: 'day-1', date: new Date('2024-06-01T00:00:00.000Z') },
        { id: 'day-2', date: new Date('2024-06-02T00:00:00.000Z') },
      ];
      mockTx.trip.findUnique.mockResolvedValue({
        ...makeTrip({
          startDate: new Date('2024-06-01T00:00:00.000Z'),
          endDate: new Date('2024-06-02T00:00:00.000Z'),
        }),
        itinerary: { id: 'itin-1', days: existingDays },
      });
      mockTx.trip.update.mockResolvedValue(makeTrip());

      // Expand: new range is Jun 1–4
      await tripService.update('trip-1', {
        endDate: new Date('2024-06-04T00:00:00.000Z'),
      } as any);

      const callArg = mockTx.tripDay.createMany.mock.calls[0]![0];
      // Should only create Jun 3 and Jun 4 (Jun 1–2 already exist)
      expect(callArg.data).toHaveLength(2);
    });
  });
});

// ─── deleteTripById ───────────────────────────────────────────────────────────

describe('deleteTripById', () => {
  it('calls prisma delete with the correct trip id', async () => {
    vi.mocked(prisma.trip.delete).mockResolvedValue(makeTrip() as any);

    await tripService.deleteTripById('trip-1');

    expect(prisma.trip.delete).toHaveBeenCalledWith({ where: { id: 'trip-1' } });
  });

  it('propagates error when prisma throws (e.g. trip not found)', async () => {
    vi.mocked(prisma.trip.delete).mockRejectedValue(new Error('Record not found'));

    await expect(tripService.deleteTripById('bad-id')).rejects.toThrow('Record not found');
  });
});
