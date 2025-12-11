// socket/socket.service.ts
import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import type { TypedServer, TypedSocket } from './types';
import passport from 'passport';
import { sessionMiddleware } from '../middleware/session';
import { authMiddleware } from './middleware/auth';
import { registerHandlers } from './handlers';
import dotenv from 'dotenv';

dotenv.config();

// Socket.IO setup
const wrap = (middleware: any) => (socket: any, next: any) => {
  // Create a fake response object with required methods
  const res = {
    end: () => {},
    setHeader: () => {},
  };
  middleware(socket.request, res, next);
};

export class SocketService {
  private io: TypedServer;
  // Track user connections per trip: Map<tripId, Map<userId, Set<socketId>>>
  private tripConnections: Map<string, Map<string, Set<string>>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  private setupMiddleware() {
    this.io.use(wrap(sessionMiddleware));  // share session middleware with socket.io
    this.io.use(wrap(passport.initialize())); // initialize passport for socket
    this.io.use(wrap(passport.session()));   // deserialize user from session
    this.io.use(authMiddleware);
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket: TypedSocket) => {
        console.log(`User connected: ${socket.data.userId}`);
       
        if (socket.data.userId) {
            socket.join(`user:${socket.data.userId}`);
        }

        registerHandlers(this.io, socket, this.tripConnections);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);

            // Clean up user from all rooms
            if (socket.data.userId && socket.data.tripId) {
                const tripId = socket.data.tripId;
                const userId = socket.data.userId;
                
                // Remove this socket from trip connections tracking
                const tripMap = this.tripConnections.get(tripId);
                if (tripMap) {
                    const userSockets = tripMap.get(userId);
                    if (userSockets) {
                        userSockets.delete(socket.id);
                        console.log(`Removed socket ${socket.id} from trip ${tripId}, user ${userId} has ${userSockets.size} remaining connections`);
                        
                        // Only notify if this was the user's LAST connection to this trip
                        if (userSockets.size === 0) {
                            console.log(`User ${userId} has no more connections to trip ${tripId}, notifying others`);
                            tripMap.delete(userId);
                            this.io.to(`trip:${tripId}`).emit("trip:userLeft", {
                                userId: userId,
                                tripId: tripId,
                                timestamp: new Date()
                            });
                        }
                        
                        // Clean up empty maps
                        if (tripMap.size === 0) {
                            this.tripConnections.delete(tripId);
                        }
                    }
                }
                
                // Leave personal room
                socket.leave(`user:${socket.data.userId}`);
            }
        });
    });
  }

  getIO(): TypedServer {
    return this.io;
  }

//   // Utility method for emitting from services
//   emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
//     this.io.to(userId).emit(event, data);
//   }

//   emitToRoom(roomId: string, event: keyof ServerToClientEvents, data: any) {
//     this.io.to(roomId).emit(event, data);
//   }
}