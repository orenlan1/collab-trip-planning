
import type { TypedSocket } from '../types/socket';

import { Server } from 'socket.io';
// Middleware to authenticate socket connections
export const socketAuth = (socket: TypedSocket, next: (err?: Error) => void) => {
  
  // @ts-ignore - user is added by passport
  const userId = socket.request.user?.id;

  console.log("Socket userId:", userId);
    
  if (!userId) {
    console.log("Socket auth failed: no user ID");
    next(new Error('Unauthorized'));
    return;
  }

  // Store userId in socket data
  socket.data.userId = userId;
  next();
};

export const onConnection = (socket: TypedSocket) => {
  console.log("Client connected:", socket.id);

  // Add user to their personal room
  if (socket.data.userId) {
    socket.join(`user:${socket.data.userId}`);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    if (socket.data.userId) {
      socket.leave(`user:${socket.data.userId}`);
    }
  });
};
