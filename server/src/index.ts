import express from 'express';
import dotenv from 'dotenv';
import passport from './auth/passport.js';
import { sessionMiddleware } from './middleware/session.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tripRoutes from './routes/trip.js';
import itineraryRoutes from './routes/itinerary.js';
import flightRoutes from './routes/flight.js';
import lodgingRoutes from './routes/lodging.js';
import invitationRoutes from './routes/invitation.js';
import messageRoutes from './routes/message.js';
import budgetRoutes from './routes/budget.js';
import cors from 'cors';
import { Server } from "socket.io" 
import { createServer} from "http"
import { onConnection, socketAuth } from './sockets/index.js';

dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

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

// Socket.IO setup
const wrap = (middleware: any) => (socket: any, next: any) => {
  // Create a fake response object with required methods
  const res = {
    end: () => {},
    setHeader: () => {},
  };
  middleware(socket.request, res, next);
};

// Set up Socket.IO middleware
io.use(wrap(sessionMiddleware));  // Session must be first
io.use(wrap(passport.initialize())); // Then passport initialize
io.use(wrap(passport.session()));   // Then passport session
io.use(socketAuth);  // Finally our auth check
io.on("connection", onConnection);

// Make socket server available to Express routes
app.set('io', io);


app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips/invite', invitationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/lodgings', lodgingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', budgetRoutes);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
