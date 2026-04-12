import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import passport from './auth/passport.js';
import { sessionMiddleware } from './middleware/session.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter.js';
import { SocketService } from './sockets/socket-service.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tripRoutes from './routes/trip.js';
import invitationRoutes from './routes/invitation.js';
import currencyRoutes from './routes/currency.js';
import airportRoutes from './routes/airport.js';
import airlineRoutes from './routes/airline.js';
import destinationRoutes from './routes/destination.js';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);
  const socketService = new SocketService(httpServer);

  app.use(globalRateLimiter);
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  app.set('io', socketService.getIO());

  app.use('/auth', authRateLimiter, authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trips/invite', invitationRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/airports', airportRoutes);
  app.use('/api/airlines', airlineRoutes);
  app.use('/api/destinations', destinationRoutes);
  app.use('/api', currencyRoutes);

  app.use(errorHandler);

  return { app, httpServer };
}
