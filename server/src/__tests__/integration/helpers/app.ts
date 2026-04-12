import dotenv from 'dotenv';
// Load test env before app imports so session/db config picks it up
dotenv.config({ path: 'src/__tests__/integration/.env.test' });

import { createApp } from '../../../app.js';
import type { Express } from 'express';
import type { Server } from 'http';

let appInstance: Express | null = null;
let serverInstance: Server | null = null;

/**
 * Returns a singleton Express app for integration tests.
 * Reusing one instance avoids re-initialising Passport and Socket.IO
 * on every test file.
 */
export function getTestApp(): Express {
  if (!appInstance) {
    const { app, httpServer } = createApp();
    appInstance = app;
    serverInstance = httpServer;
  }
  return appInstance;
}

export async function closeTestServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverInstance?.listening) {
      serverInstance.close(() => resolve());
    } else {
      resolve();
    }
  });
}
