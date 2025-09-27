
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

  // Add user to their personal room for direct notifications
  if (socket.data.userId) {
    socket.join(`user:${socket.data.userId}`);
  }

  // Handle joining a specific trip chat room
  socket.on("joinTripChat", async (tripId: string) => {
    try {
      // TODO: Verify user is a member of this trip
      // You should check against your database here
      console.log(`User ${socket.data.userId} joining trip chat: ${tripId}`);
      
      // Leave any previous trip room (user can only be in one trip chat at a time)
      const rooms = Array.from(socket.rooms);
      const tripRooms = rooms.filter(room => room.startsWith('trip:'));
      tripRooms.forEach(room => socket.leave(room));
      
      // Join the new trip room
      await socket.join(`trip:${tripId}`);
      
      // Notify others in the room that user joined
      socket.to(`trip:${tripId}`).emit("userJoinedChat", {
        userId: socket.data.userId,
        tripId,
        timestamp: new Date()
      });
      
      // Confirm to the user they joined successfully
      socket.emit("joinedTripChat", { tripId });
      
    } catch (error) {
      console.error("Error joining trip chat:", error);
      socket.emit("error", { message: "Failed to join trip chat" });
    }
  });

  // Handle leaving a trip chat room
  socket.on("leaveTripChat", (tripId: string) => {
    console.log(`User ${socket.data.userId} leaving trip chat: ${tripId}`);
    
    socket.leave(`trip:${tripId}`);
    
    // Notify others in the room that user left
    socket.to(`trip:${tripId}`).emit("userLeftChat", {
      userId: socket.data.userId,
      tripId,
      timestamp: new Date()
    });
  });

  // Handle sending messages
  socket.on("sendMessage", async (data: {
    tripId: string;
    content: string;
    type: 'text' | 'image' | 'file';
  }) => {
    try {
      // TODO: Save message to database
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: socket.data.userId,
        tripId: data.tripId,
        content: data.content,
        type: data.type,
        timestamp: new Date()
      };
      
      console.log(`Message from user ${socket.data.userId} in trip ${data.tripId}:`, data.content);
      
      // Broadcast message to all users in the trip room
      socket.to(`trip:${data.tripId}`).emit("newMessage", message);
      
      // Send confirmation back to sender
      socket.emit("messageDelivered", { messageId: message.id });
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data: { tripId: string; isTyping: boolean; name: string }) => {
    socket.to(`trip:${data.tripId}`).emit("userTyping", {
      userId: socket.data.userId,
      isTyping: data.isTyping,
      tripId: data.tripId,
      name: data.name
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    
    // Clean up user from all rooms
    if (socket.data.userId) {
      // Leave personal room
      socket.leave(`user:${socket.data.userId}`);
      
      // Notify trip rooms that user disconnected
      const rooms = Array.from(socket.rooms);
      const tripRooms = rooms.filter(room => room.startsWith('trip:'));
      tripRooms.forEach(room => {
        const tripId = room.replace('trip:', '');
        socket.to(room).emit("userLeftChat", {
          userId: socket.data.userId,
          tripId,
          timestamp: new Date()
        });
      });
    }
  });
};
