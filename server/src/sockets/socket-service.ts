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

        registerHandlers(this.io, socket);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);

            // Clean up user from all rooms
            if (socket.data.userId) {
                // Leave personal room
                socket.leave(`user:${socket.data.userId}`);
                
                // Notify trip rooms that user disconnected
                const rooms = Array.from(socket.rooms);
                const tripRooms = rooms.filter(room => room.startsWith('trip:'));
                tripRooms.forEach(room => {
                    const tripId = room.replace('trip:', '');
                    socket.to(room).emit("trip::userLeft", {
                    userId: socket.data.userId,
                    tripId,
                    timestamp: new Date()
                    });
                });
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