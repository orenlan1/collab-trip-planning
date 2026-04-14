import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { getTestApp } from './helpers/app.js';
import { registerAndLogin, anonAgent, type AuthAgent } from './helpers/auth.js';
import { prisma } from '../../prisma/client.js';

// Suppress the Unsplash fetch — it's an external dependency irrelevant to DB logic.
// Without this, trip creation makes real HTTP calls and may throw on invalid keys.
vi.mock('../../apiClients/unsplash/images.js', () => ({
  fetchImageURL: vi.fn().mockResolvedValue(null),
}));

// ─── Test fixtures ────────────────────────────────────────────────────────────

const OWNER = {
  email: 'trip-owner@tripsync.test',
  password: 'TestPassword123!',
  name: 'Trip Owner',
};

const OTHER = {
  email: 'trip-other@tripsync.test',
  password: 'TestPassword123!',
  name: 'Other User',
};

// A known destination string that will match the seeded Country row.
const KNOWN_COUNTRY_DEST = 'Testonia';
const KNOWN_CITY_DEST = 'Testville, Testonia';

const BASE_TRIP = {
  title: 'Integration Test Trip',
  destination: 'Unknown Destination XYZ',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the number of TripDay rows for a given trip. */
async function getTripDayCount(agent: AuthAgent, tripId: string): Promise<number> {
  const res = await agent.get(`/api/trips/${tripId}/itinerary`).expect(200);
  return (res.body.days as unknown[]).length;
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Trip endpoints', () => {
  const app = getTestApp();
  let ownerAgent: AuthAgent;
  let otherAgent: AuthAgent;
  let seededCountryId: number;
  let seededCityId: number;

  beforeAll(async () => {
    // Ensure clean slate
    await prisma.user.deleteMany({
      where: { email: { in: [OWNER.email, OTHER.email] } },
    });

    // Seed a known Country + City so lat/lng tests produce non-null values
    const country = await prisma.country.create({
      data: { name: 'Testonia', latitude: 51.5, longitude: -0.1 },
    });
    seededCountryId = country.id;

    const city = await prisma.city.create({
      data: {
        name: 'Testville',
        countryId: country.id,
        latitude: 48.8,
        longitude: 2.3,
      },
    });
    seededCityId = city.id;

    // Register both test users and capture their authenticated agents
    ownerAgent = await registerAndLogin(app, OWNER);
    otherAgent = await registerAndLogin(app, OTHER);
  });

  afterAll(async () => {
    // Cascade-deletes all trips created by these users
    await prisma.user.deleteMany({
      where: { email: { in: [OWNER.email, OTHER.email] } },
    });
    await prisma.city.deleteMany({ where: { id: seededCityId } });
    await prisma.country.deleteMany({ where: { id: seededCountryId } });
  });

  // ─── POST /trips ────────────────────────────────────────────────────────────

  describe('POST /trips', () => {
    it('returns 401 when not authenticated', async () => {
      await anonAgent(app).post('/api/trips').send(BASE_TRIP).expect(401);
    });

    it('returns 400 when title is missing', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({ destination: 'Paris, France' })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.details).toBeDefined();
    });

    it('returns 400 when destination is missing', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({ title: 'No Destination' })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.details).toBeDefined();
    });

    it('returns 400 when start date is after end date', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({
          ...BASE_TRIP,
          startDate: '2026-12-10',
          endDate: '2026-12-05',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.details).toBeDefined();
    });

    it('returns 400 if start date is invalid', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({
          ...BASE_TRIP,
          startDate: 'invalid-date',
          endDate: '2026-12-10',
        })
        .expect(400);

      expect(res.body.error).toBeDefined();
      expect(res.body.details).toBeDefined();
    });

    it('creates a trip without dates — lat/lng null for unknown destination', async () => {
      const res = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(BASE_TRIP.title);
      expect(res.body.destination).toBe(BASE_TRIP.destination);
      expect(res.body.startDate).toBeNull();
      expect(res.body.endDate).toBeNull();
      expect(res.body.latitude).toBeNull();
      expect(res.body.longitude).toBeNull();
    });

    it('populates lat/lng when destination matches a known country', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({ title: 'Country Dest Trip', destination: KNOWN_COUNTRY_DEST })
        .expect(201);

      expect(res.body.latitude).toBe(51.5);
      expect(res.body.longitude).toBe(-0.1);
    });

    it('populates lat/lng when destination matches a known city', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({ title: 'City Dest Trip', destination: KNOWN_CITY_DEST })
        .expect(201);

      expect(res.body.latitude).toBe(48.8);
      expect(res.body.longitude).toBe(2.3);
    });

    it('creates trip days when start/end date are provided', async () => {
      const res = await ownerAgent
        .post('/api/trips')
        .send({ ...BASE_TRIP, startDate: '2026-07-01', endDate: '2026-07-03' })
        .expect(201);

      expect(res.body.startDate).toBe('2026-07-01');
      expect(res.body.endDate).toBe('2026-07-03');

      // July 1, 2, 3 → 3 days
      const dayCount = await getTripDayCount(ownerAgent, res.body.id);
      expect(dayCount).toBe(3);
    });

    it('creates no trip days when no dates are provided', async () => {
      const res = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);

      const dayCount = await getTripDayCount(ownerAgent, res.body.id);
      expect(dayCount).toBe(0);
    });

    it('adds the creator as a member with role "creator"', async () => {
      const createRes = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);

      const detailRes = await ownerAgent
        .get(`/api/trips/${createRes.body.id}`)
        .expect(200);

      const members: Array<{ role: string }> = detailRes.body.members;
      expect(members).toHaveLength(1);
      expect(members[0]!.role).toBe('creator');
    });
  });

  // ─── GET /trips ─────────────────────────────────────────────────────────────

  describe('GET /trips', () => {
    it('returns 401 when not authenticated', async () => {
      await anonAgent(app).get('/api/trips').expect(401);
    });

    it('returns the list of trips for the authenticated user', async () => {
      // Create a trip first so the list is non-empty
      await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);

      const res = await ownerAgent.get('/api/trips').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      // Each entry must have at least id and title
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('title');
    });

    it("does not return another user's private trips", async () => {
      // Create a trip for each user so neither list is empty (avoids vacuous pass)
      await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);
      await otherAgent.post('/api/trips').send({ ...BASE_TRIP, title: "Other's Trip" }).expect(201);

      const ownerTrips: Array<{ id: string }> = (
        await ownerAgent.get('/api/trips').expect(200)
      ).body;

      const otherTrips: Array<{ id: string }> = (
        await otherAgent.get('/api/trips').expect(200)
      ).body;

      // Guard: both lists must be non-empty or the cross-check below is meaningless
      expect(ownerTrips.length).toBeGreaterThan(0);
      expect(otherTrips.length).toBeGreaterThan(0);

      const ownerIds = new Set(ownerTrips.map((t) => t.id));
      const otherIds = new Set(otherTrips.map((t) => t.id));

      // No trip belonging to OTHER should appear in OWNER's list and vice-versa
      otherTrips.forEach((t) => expect(ownerIds.has(t.id)).toBe(false));
      ownerTrips.forEach((t) => expect(otherIds.has(t.id)).toBe(false));
    });
  });

  // ─── GET /trips/:id ─────────────────────────────────────────────────────────

  describe('GET /trips/:id', () => {
    let tripId: string;

    beforeAll(async () => {
      const res = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);
      tripId = res.body.id;
    });

    it('returns 401 when not authenticated', async () => {
      await anonAgent(app).get(`/api/trips/${tripId}`).expect(401);
    });

    it('returns trip details including members', async () => {
      const res = await ownerAgent.get(`/api/trips/${tripId}`).expect(200);

      expect(res.body.id).toBe(tripId);
      expect(res.body.title).toBe(BASE_TRIP.title);
      expect(Array.isArray(res.body.members)).toBe(true);
    });

    it('returns 404 for a non-existent trip ID', async () => {
      await ownerAgent
        .get('/api/trips/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ─── PATCH /trips/:id ───────────────────────────────────────────────────────

  describe('PATCH /trips/:id', () => {
    let tripId: string;

    // Fresh trip before each test so each case starts from a clean state
    beforeEach(async () => {
      const res = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);
      tripId = res.body.id;
    });

    it('returns 401 when not authenticated', async () => {
      await anonAgent(app)
        .patch(`/api/trips/${tripId}`)
        .send({ title: 'Hijack' })
        .expect(401);
    });

    it('returns 403 when user is not a trip member', async () => {
      await otherAgent
        .patch(`/api/trips/${tripId}`)
        .send({ title: 'Hijack' })
        .expect(403);
    });

    it('updates the trip title', async () => {
      const res = await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ title: 'New Title' })
        .expect(200);

      expect(res.body.title).toBe('New Title');
    });

    it('updates destination to an unknown place — lat/lng becomes null', async () => {
      const res = await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ destination: 'Nowhere XYZ' })
        .expect(200);

      expect(res.body.destination).toBe('Nowhere XYZ');
      expect(res.body.latitude).toBeNull();
      expect(res.body.longitude).toBeNull();
    });

    it('updates destination to a known country — lat/lng is recalculated', async () => {
      const res = await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ destination: KNOWN_COUNTRY_DEST })
        .expect(200);

      expect(res.body.destination).toBe(KNOWN_COUNTRY_DEST);
      expect(res.body.latitude).toBe(51.5);
      expect(res.body.longitude).toBe(-0.1);
    });

    it('updates destination to a known city — lat/lng is recalculated', async () => {
      const res = await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ destination: KNOWN_CITY_DEST })
        .expect(200);

      expect(res.body.destination).toBe(KNOWN_CITY_DEST);
      expect(res.body.latitude).toBe(48.8);
      expect(res.body.longitude).toBe(2.3);
    });

    it('creates trip days when dates are set for the first time', async () => {
      // Confirm no days yet
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(0);

      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ startDate: '2026-08-01', endDate: '2026-08-04' })
        .expect(200);

      // Aug 1, 2, 3, 4 → 4 days
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(4);
    });

    it('adds new trip days when the date range is extended', async () => {
      // Set initial 3-day range
      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ startDate: '2026-09-01', endDate: '2026-09-03' })
        .expect(200);
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(3);

      // Extend end by 2 days
      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ endDate: '2026-09-05' })
        .expect(200);

      // Sep 1–5 → 5 days
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(5);
    });

    it('removes trip days when the date range is shortened', async () => {
      // Set initial 5-day range
      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ startDate: '2026-10-01', endDate: '2026-10-05' })
        .expect(200);
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(5);

      // Shorten end — drop Oct 4 and Oct 5
      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ endDate: '2026-10-03' })
        .expect(200);

      // Oct 1–3 → 3 days
      expect(await getTripDayCount(ownerAgent, tripId)).toBe(3);
    });

    it('returns 400 when end date is before start date', async () => {
      await ownerAgent
        .patch(`/api/trips/${tripId}`)
        .send({ startDate: '2026-12-10', endDate: '2026-12-05' })
        .expect(400);
    });
  });

  // ─── DELETE /trips/:id ──────────────────────────────────────────────────────

  describe('DELETE /trips/:id', () => {
    let tripId: string;

    beforeEach(async () => {
      const res = await ownerAgent.post('/api/trips').send(BASE_TRIP).expect(201);
      tripId = res.body.id;
    });

    it('returns 401 when not authenticated', async () => {
      await anonAgent(app).delete(`/api/trips/${tripId}`).expect(401);
    });

    it('returns 403 when user is not a member of the trip', async () => {
      await otherAgent.delete(`/api/trips/${tripId}`).expect(403);
    });

    it('returns 403 when user is a member but not the creator', async () => {
      // Directly insert OTHER as a regular member (no invite flow needed for setup)
      const otherUser = await prisma.user.findUniqueOrThrow({
        where: { email: OTHER.email },
        select: { id: true },
      });
      await prisma.tripMember.create({
        data: { tripId, userId: otherUser.id, role: 'member' },
      });

      await otherAgent.delete(`/api/trips/${tripId}`).expect(403);
    });

    it('owner deletes the trip and subsequent GET returns 404', async () => {
      await ownerAgent.delete(`/api/trips/${tripId}`).expect(204);
      await ownerAgent.get(`/api/trips/${tripId}`).expect(404);
    });

    it('deleting a trip cascades to itinerary and all trip days', async () => {
      // Create a trip with dates so days actually exist
      const withDatesRes = await ownerAgent
        .post('/api/trips')
        .send({ ...BASE_TRIP, startDate: '2026-11-01', endDate: '2026-11-03' })
        .expect(201);
      const withDatesId: string = withDatesRes.body.id;

      // Verify 3 days were created
      expect(await getTripDayCount(ownerAgent, withDatesId)).toBe(3);

      // Find the itinerary ID before deletion
      const itinerary = await prisma.itinerary.findUniqueOrThrow({
        where: { tripId: withDatesId },
        select: { id: true },
      });

      // Delete the trip
      await ownerAgent.delete(`/api/trips/${withDatesId}`).expect(204);

      // Itinerary and all days must be gone (CASCADE)
      const remainingDays = await prisma.tripDay.count({
        where: { itineraryId: itinerary.id },
      });
      expect(remainingDays).toBe(0);

      const itineraryGone = await prisma.itinerary.findUnique({
        where: { id: itinerary.id },
      });
      expect(itineraryGone).toBeNull();
    });
  });
});
