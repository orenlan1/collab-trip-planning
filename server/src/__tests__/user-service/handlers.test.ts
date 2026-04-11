import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../../services/user-service.js';
import { prisma } from '../../prisma/client.js';

vi.mock('../../prisma/client.js', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
    trip: {
      findUnique: vi.fn(),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── isMemberOfTheTrip ────────────────────────────────────────────────────────

describe('isMemberOfTheTrip', () => {
  it('returns true when the user is a member of the trip', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue({
      id: 'trip-1',
      members: [
        { userId: 'user-1' },
        { userId: 'user-2' },
      ],
    } as any);

    const result = await userService.isMemberOfTheTrip('user-1', 'trip-1');

    expect(result).toBe(true);
  });

  it('returns false when the user is not a member of the trip', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue({
      id: 'trip-1',
      members: [{ userId: 'user-2' }],
    } as any);

    const result = await userService.isMemberOfTheTrip('user-1', 'trip-1');

    expect(result).toBe(false);
  });

  it('returns false when the trip does not exist', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue(null);

    const result = await userService.isMemberOfTheTrip('user-1', 'nonexistent-trip');

    expect(result).toBe(false);
  });

  it('returns false when the trip has no members', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue({
      id: 'trip-1',
      members: [],
    } as any);

    const result = await userService.isMemberOfTheTrip('user-1', 'trip-1');

    expect(result).toBe(false);
  });

  it('queries the trip by the provided tripId and includes members', async () => {
    vi.mocked(prisma.trip.findUnique).mockResolvedValue({
      id: 'trip-1',
      members: [],
    } as any);

    await userService.isMemberOfTheTrip('user-1', 'trip-1');

    expect(prisma.trip.findUnique).toHaveBeenCalledWith({
      where: { id: 'trip-1' },
      include: { members: true },
    });
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('update', () => {
  const mockUser = { id: 'user-1', email: 'alice@test.com', name: 'Alice', image: null } as Express.User;

  it('updates the user name when name is provided', async () => {
    const updated = { ...mockUser, name: 'Alice Smith' };
    vi.mocked(prisma.user.update).mockResolvedValue(updated as any);

    const result = await userService.update(mockUser, { name: 'Alice Smith' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ name: 'Alice Smith' }),
      })
    );
    expect(result).toEqual(updated);
  });

  it('updates the user image when image is provided', async () => {
    const updated = { ...mockUser, image: 'https://example.com/photo.jpg' };
    vi.mocked(prisma.user.update).mockResolvedValue(updated as any);

    await userService.update(mockUser, { image: 'https://example.com/photo.jpg' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ image: 'https://example.com/photo.jpg' }),
      })
    );
  });

  it('omits undefined fields from the update payload', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

    await userService.update(mockUser, { name: 'Alice' });

    const callArg = vi.mocked(prisma.user.update).mock.calls[0]![0];
    expect(callArg.data).not.toHaveProperty('image');
  });

  it('omits the password field from the returned user', async () => {
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any);

    await userService.update(mockUser, { name: 'Alice' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        omit: { password: true },
      })
    );
  });
});
