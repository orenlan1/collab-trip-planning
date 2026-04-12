import request from 'supertest';
import type { Express } from 'express';
import type { Test } from 'supertest';

export type AuthAgent = ReturnType<typeof request.agent>;

/**
 * Creates a supertest agent that persists cookies (session) across requests,
 * then registers and logs in with the given credentials.
 *
 * Returns the authenticated agent so all subsequent requests in a test
 * carry the session cookie automatically.
 */
export async function registerAndLogin(
  app: Express,
  credentials: { email: string; password: string; name: string }
): Promise<AuthAgent> {
  const agent = request.agent(app);

  await agent
    .post('/auth/register')
    .send(credentials)
    .expect(201);

  return agent;
}

/**
 * Creates a fresh agent and logs in with an already-registered user.
 */
export async function loginAs(
  app: Express,
  credentials: { email: string; password: string }
): Promise<AuthAgent> {
  const agent = request.agent(app);

  await agent
    .post('/auth/login')
    .send(credentials)
    .expect(200);

  return agent;
}

/**
 * Returns an unauthenticated supertest agent (no cookies).
 * Useful for testing 401 guard behaviour.
 */
export function anonAgent(app: Express): AuthAgent {
  return request.agent(app);
}
