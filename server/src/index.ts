import express from 'express';
import dotenv from 'dotenv';
import passport from './auth/passport.js';
import { sessionMiddleware } from './middleware/session.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tripRoutes from './routes/trip.js';
import invitationRoutes from './routes/invitation.js';
import currencyRoutes from './routes/currency.js';
import airportRoutes from './routes/airport.js';
import airlineRoutes from './routes/airline.js';
import destinationRoutes from './routes/destination.js';
import cors from 'cors';
import { createServer} from "http"
import { SocketService } from './sockets/socket-service.js';

dotenv.config();

const app = express();

const httpServer = createServer(app);

const socketService = new SocketService(httpServer);
  

// Express middleware setup
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Make socket server available to Express routes
app.set('io', socketService.getIO());


app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips/invite', invitationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api', currencyRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
