import { prisma } from '../../../prisma/client.js';

export const TEST_USER = {
  email: 'integration-test@tripsync.test',
  password: 'TestPassword123!',
  name: 'Integration Tester',
};

/**
 * Deletes the test user and all cascaded data (trips, sessions, etc.).
 * Safe to call even if the user does not exist.
 */
export async function cleanupTestUser(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
}

/**
 * Disconnects the Prisma client. Call once in a global teardown or in the
 * last afterAll that runs.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
