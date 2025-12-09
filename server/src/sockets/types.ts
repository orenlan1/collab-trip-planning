import type { Socket, Server } from 'socket.io';
import type { Activity } from '@prisma/client';


// Define your custom events here
interface ServerToClientEvents {
  "invite:created": (invitation: { tripId: string; inviterId: string }) => void;
  
  "trip::userJoined": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "trip::userLeft": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "trip:joined": (data: { tripId: string }) => void;
  "chat:newMessage": (message: { 
    id: string; 
    userId: string; 
    tripId: string; 
    content: string; 
    type: 'text' | 'image' | 'file'; 
    timestamp: Date 
  }) => void;
  "chat:messageDelivered": (data: { messageId: string }) => void;
  "chat:userTyping": (data: { userId: string; isTyping: boolean; tripId: string; name: string }) => void;

  "activity:created": (data: ActivitySocketData) => void;
  "activity:updated": (data: ActivitySocketData) => void;
  "activity:deleted": (data: ActivityDeletedSocketData) => void;
  "error": (data: { message: string }) => void;
}

interface ClientToServerEvents {

  "trip:join": (tripId: string) => void;
  "trip:leave": (tripId: string) => void;
  "chat:sendMessage": (data: { tripId: string; content: string; type: 'text' | 'image' | 'file' }) => void;
  "chat:typing": (data: { tripId: string; isTyping: boolean; name: string }) => void;
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

export interface ActivitySocketData {
  activity: Activity;
  tripDayId: string;
  creatorId: string;
  creatorName: string | null;
  excludeNotification?: boolean;
}

export interface ActivityDeletedSocketData {
  activityId: string;
  tripDayId: string;
  deletedById: string;
  deletedByName: string | null;
}
