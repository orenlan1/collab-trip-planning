import type { Socket, Server } from 'socket.io';

// Define your custom events here
interface ServerToClientEvents {
  "invite:created": (invitation: { tripId: string; inviterId: string }) => void;
  
  // Chat events - server to client
  "userJoinedChat": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "userLeftChat": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "newMessage": (message: { 
    id: string; 
    userId: string; 
    tripId: string; 
    content: string; 
    type: 'text' | 'image' | 'file'; 
    timestamp: Date 
  }) => void;
  "messageDelivered": (data: { messageId: string }) => void;
  "userTyping": (data: { userId: string; isTyping: boolean; tripId: string; name: string }) => void;
  "joinedTripChat": (data: { tripId: string }) => void;
  "error": (data: { message: string }) => void;
}

interface ClientToServerEvents {
  // Chat events - client to server
  "joinTripChat": (tripId: string) => void;
  "leaveTripChat": (tripId: string) => void;
  "sendMessage": (data: { tripId: string; content: string; type: 'text' | 'image' | 'file' }) => void;
  "typing": (data: { tripId: string; isTyping: boolean; name: string }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
