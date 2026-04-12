import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/integration/**/*.test.ts'],
    // Run all integration test files sequentially in the same process.
    // This prevents parallel test files from colliding on shared DB rows.
    pool: 'forks',
    singleFork: true,
    // Give real DB calls more time than the default 5 s
    testTimeout: 15000,
    hookTimeout: 15000,
    // Non-sensitive defaults committed here so CI doesn't need .env.test.
    // DATABASE_URL must be provided via CI secret or local .env.test —
    // it is intentionally absent here since it contains credentials.
    env: {
      NODE_ENV: 'test',
      CLIENT_URL: 'http://localhost:5173',
      SESSION_SECRET: 'integration-test-secret',
      GOOGLE_CLIENT_ID: 'test-placeholder',
      GOOGLE_CLIENT_SECRET: 'test-placeholder',
    },
  },
});
