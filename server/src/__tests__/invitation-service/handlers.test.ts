import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvitationService } from '../../services/invitation-service.js';
import { NotFoundError, ConflictError } from '../../errors/AppError.js';

// vi.hoisted ensures the mock instance exists before the vi.mock factory runs
const mockPrisma = vi.hoisted(() => ({
  invitation: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  tripMember: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));

// PrismaClient must be a regular function (not arrow) so it can be used with `new`
vi.mock('@prisma/client', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PrismaClient: function MockPrismaClient(this: any) {
    Object.assign(this, mockPrisma);
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createMagicLinkInvitation ────────────────────────────────────────────────

describe('createMagicLinkInvitation', () => {
  it('creates a magic link invitation with a UUID token', async () => {
    const fakeInvitation = {
      id: 'inv-1',
      tripId: 'trip-1',
      inviterUserId: 'user-1',
      token: 'some-uuid',
      type: 'MAGIC_LINK',
      status: 'ACTIVE',
      expiresAt: new Date(),
      trip: { id: 'trip-1', title: 'Paris' },
      inviterUser: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
    };
    mockPrisma.invitation.create.mockResolvedValue(fakeInvitation);

    const service = new InvitationService();
    const result = await service.createMagicLinkInvitation('trip-1', 'user-1');

    expect(mockPrisma.invitation.create).toHaveBeenCalledOnce();
    const callArg = mockPrisma.invitation.create.mock.calls[0]![0]!.data;
    expect(callArg.tripId).toBe('trip-1');
    expect(callArg.inviterUserId).toBe('user-1');
    expect(callArg.type).toBe('MAGIC_LINK');
    expect(callArg.status).toBe('ACTIVE');
    // UUID v4 is 36 characters
    expect(typeof callArg.token).toBe('string');
    expect(callArg.token).toHaveLength(36);
    expect(result).toEqual(fakeInvitation);
  });

  it('sets the expiry to approximately 72 hours from now', async () => {
    const before = new Date();
    mockPrisma.invitation.create.mockResolvedValue({} as any);

    const service = new InvitationService();
    await service.createMagicLinkInvitation('trip-1', 'user-1');

    const expiresAt: Date = mockPrisma.invitation.create.mock.calls[0]![0]!.data.expiresAt;
    const diffHours = (expiresAt.getTime() - before.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeGreaterThanOrEqual(71.9);
    expect(diffHours).toBeLessThanOrEqual(72.1);
  });
});

// ─── acceptMagicLinkInvitation ────────────────────────────────────────────────

describe('acceptMagicLinkInvitation', () => {
  const fakeInvitation = {
    id: 'inv-1',
    tripId: 'trip-1',
    token: 'valid-token',
    type: 'MAGIC_LINK',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 3600 * 1000),
    trip: { id: 'trip-1', title: 'Paris' },
  };
  const fakeMember = { id: 'member-1', tripId: 'trip-1', userId: 'user-2', role: 'member' };

  it('throws NotFoundError for an invalid or expired token', async () => {
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: any) => unknown) => {
      const tx = {
        invitation: { findFirst: vi.fn().mockResolvedValue(null) },
        tripMember: { findFirst: vi.fn(), create: vi.fn() },
      };
      return fn(tx);
    });

    const service = new InvitationService();

    await expect(
      service.acceptMagicLinkInvitation('expired-token', 'user-2')
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError when user is already a trip member', async () => {
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: any) => unknown) => {
      const tx = {
        invitation: { findFirst: vi.fn().mockResolvedValue(fakeInvitation) },
        tripMember: {
          findFirst: vi.fn().mockResolvedValue({ id: 'existing-member' }),
          create: vi.fn(),
        },
      };
      return fn(tx);
    });

    const service = new InvitationService();

    await expect(
      service.acceptMagicLinkInvitation('valid-token', 'user-2')
    ).rejects.toThrow(ConflictError);
  });

  it('creates a new trip member and returns invitation + member on success', async () => {
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: any) => unknown) => {
      const tx = {
        invitation: { findFirst: vi.fn().mockResolvedValue(fakeInvitation) },
        tripMember: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue(fakeMember),
        },
      };
      return fn(tx);
    });

    const service = new InvitationService();
    const result = await service.acceptMagicLinkInvitation('valid-token', 'user-2') as any;

    expect(result.invitation).toEqual(fakeInvitation);
    expect(result.member).toEqual(fakeMember);
  });

  it('creates the new member with role "member"', async () => {
    const createFn = vi.fn().mockResolvedValue(fakeMember);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: any) => unknown) => {
      const tx = {
        invitation: { findFirst: vi.fn().mockResolvedValue(fakeInvitation) },
        tripMember: { findFirst: vi.fn().mockResolvedValue(null), create: createFn },
      };
      return fn(tx);
    });

    const service = new InvitationService();
    await service.acceptMagicLinkInvitation('valid-token', 'user-2');

    expect(createFn).toHaveBeenCalledWith({
      data: { tripId: 'trip-1', userId: 'user-2', role: 'member' },
    });
  });
});

// ─── getInvitationByToken ─────────────────────────────────────────────────────

describe('getInvitationByToken', () => {
  const fakeInvitation = {
    id: 'inv-1',
    tripId: 'trip-1',
    token: 'valid-token',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 3600 * 1000),
    trip: { id: 'trip-1', title: 'Paris' },
    inviterUser: { id: 'user-1', name: 'Alice' },
  };

  it('returns null when no active invitation matches the token', async () => {
    mockPrisma.invitation.findFirst.mockResolvedValue(null);

    const service = new InvitationService();
    const result = await service.getInvitationByToken('bad-token');

    expect(result).toBeNull();
  });

  it('returns the invitation with isAlreadyMember false when userId is not provided', async () => {
    mockPrisma.invitation.findFirst.mockResolvedValue(fakeInvitation);

    const service = new InvitationService();
    const result = await service.getInvitationByToken('valid-token');

    expect(result).not.toBeNull();
    expect(result!.isAlreadyMember).toBe(false);
  });

  it('returns isAlreadyMember false when user is not a trip member', async () => {
    mockPrisma.invitation.findFirst.mockResolvedValue(fakeInvitation);
    mockPrisma.tripMember.findFirst.mockResolvedValue(null);

    const service = new InvitationService();
    const result = await service.getInvitationByToken('valid-token', 'user-99');

    expect(result!.isAlreadyMember).toBe(false);
    expect(mockPrisma.tripMember.findFirst).toHaveBeenCalledWith({
      where: { tripId: 'trip-1', userId: 'user-99' },
    });
  });

  it('returns isAlreadyMember true when user is already a trip member', async () => {
    mockPrisma.invitation.findFirst.mockResolvedValue(fakeInvitation);
    mockPrisma.tripMember.findFirst.mockResolvedValue({ id: 'member-1' });

    const service = new InvitationService();
    const result = await service.getInvitationByToken('valid-token', 'user-1');

    expect(result!.isAlreadyMember).toBe(true);
  });

  it('spreads all invitation fields into the result', async () => {
    mockPrisma.invitation.findFirst.mockResolvedValue(fakeInvitation);
    mockPrisma.tripMember.findFirst.mockResolvedValue(null);

    const service = new InvitationService();
    const result = await service.getInvitationByToken('valid-token', 'user-99');

    expect(result!.id).toBe('inv-1');
    expect(result!.tripId).toBe('trip-1');
    expect(result!.trip).toEqual({ id: 'trip-1', title: 'Paris' });
    expect(result!.inviterUser).toEqual({ id: 'user-1', name: 'Alice' });
  });
});
