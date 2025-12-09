import type { TypedSocket } from '../types';

// Middleware to authenticate socket connections
export const authMiddleware = (socket: TypedSocket, next: (err?: Error) => void) => {
  
  // @ts-ignore - user is added by passport
  const userId = socket.request.user?.id;

  console.log("Socket userId:", userId);
    
  if (!userId) {
    console.log("Socket auth failed: no user ID");
    next(new Error('Unauthorized'));
    return;
  }

  socket.data.userId = userId;
  next();
};