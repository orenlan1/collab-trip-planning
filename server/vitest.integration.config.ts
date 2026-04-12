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
  },
});
