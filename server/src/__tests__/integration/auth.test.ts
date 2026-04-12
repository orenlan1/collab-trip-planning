import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { getTestApp } from './helpers/app.js';
import { registerAndLogin, loginAs, anonAgent, type AuthAgent } from './helpers/auth.js';
import { cleanupTestUser, disconnectPrisma, TEST_USER } from './helpers/db.js';

describe('Auth endpoints', () => {
  const app = getTestApp();

  // Clean slate before and after the suite
  beforeAll(async () => {
    await cleanupTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser();
    await disconnectPrisma();
  });

  // ─── POST /auth/register ───────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('registers a new user and returns safe user data', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(TEST_USER)
        .expect(201);

      expect(res.body).toMatchObject({
        email: TEST_USER.email,
        name: TEST_USER.name,
      });
      // Password must never be returned
      expect(res.body).not.toHaveProperty('password');
      expect(res.body.id).toBeDefined();
    });

    it('returns 409 when the email is already registered', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(TEST_USER)
        .expect(409);

      expect(res.body.message).toMatch(/already registered/i);
    });

    it('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ password: 'SomePass1!', name: 'No Email' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'nopass@tripsync.test', name: 'No Pass' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });

  // ─── POST /auth/login ──────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('logs in with correct credentials and returns safe user data', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(200);

      expect(res.body).toMatchObject({ email: TEST_USER.email });
      expect(res.body).not.toHaveProperty('password');
      // Session cookie must be set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 with wrong password', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: TEST_USER.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('returns 401 with unknown email', async () => {
      await request(app)
        .post('/auth/login')
        .send({ email: 'ghost@tripsync.test', password: 'irrelevant' })
        .expect(401);
    });
  });

  // ─── GET /auth/session ─────────────────────────────────────────────────────

  describe('GET /auth/session', () => {
    it('returns the user when a valid session cookie is sent', async () => {
      const agent = await loginAs(app, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      const res = await agent.get('/auth/session').expect(200);

      expect(res.body).toMatchObject({ email: TEST_USER.email });
      expect(res.body).not.toHaveProperty('password');
    });

    it('returns 401 when no session cookie is present', async () => {
      const res = await anonAgent(app).get('/auth/session').expect(401);

      expect(res.body.message).toMatch(/not authenticated/i);
    });
  });

  // ─── POST /auth/logout ─────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    let agent: AuthAgent;

    beforeAll(async () => {
      agent = await loginAs(app, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
    });

    it('logs out and the session is no longer valid', async () => {
      await agent.post('/auth/logout').expect(200);

      // The same agent still holds the (now-invalidated) cookie — session should be gone
      const sessionRes = await agent.get('/auth/session');
      expect(sessionRes.status).toBe(401);
    });
  });

  // ─── Session persistence ───────────────────────────────────────────────────

  describe('Session persistence', () => {
    it('maintains authentication across multiple requests with the same agent', async () => {
      const agent = await loginAs(app, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      // Make several requests — cookie should be re-sent each time
      await agent.get('/auth/session').expect(200);
      await agent.get('/auth/session').expect(200);
      await agent.get('/auth/session').expect(200);
    });

    it('a stateless request (no cookie) is always unauthenticated', async () => {
      // Deliberately NOT using an agent — each call is cookie-less
      await request(app).get('/auth/session').expect(401);
      await request(app).get('/auth/session').expect(401);
    });
  });
});
