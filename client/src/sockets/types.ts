import type { Socket } from "socket.io-client";
import type { Activity } from '@/types/activity';
import type { ChatMessage } from "@/types/chat";
import type { Expense } from "@/types/expense";
import type { DraftDay } from "@/types/draft";

// Define your custom events here
interface ServerToClientEvents {
  "invite:created": (invitation: { tripId: string; inviterId: string }) => void;

  "trip:userJoined": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "trip:userLeft": (data: { userId: string; tripId: string; timestamp: Date }) => void;
  "trip:joined": (data: { tripId: string; connectedUserIds: string[] }) => void;
  "trip:datesUpdated": (data: TripDatesUpdatedData) => void;
  "chat:newMessage": (message: ChatMessage) => void;
  "chat:messageDelivered": (data: { messageId: string }) => void;
  "chat:userTyping": (data: { userId: string; isTyping: boolean; tripId: string; name: string }) => void;

  "activity:created": (data: ActivitySocketData) => void;
  "activity:updated": (data: ActivitySocketData) => void;
  "activity:deleted": (data: ActivityDeletedSocketData) => void;
  "activity:expense:created": (data: ActivityExpenseSocketData) => void;
  "activity:expense:updated": (data: ActivityExpenseSocketData) => void;
  "activity:expense:deleted": (data: ActivityExpenseDeletedSocketData) => void;

  // Draft events
  "draft:day-ready":        (data: { day: DraftDay }) => void;
  "draft:ready":            () => void;
  "draft:accepted":         () => void;
  "draft:discarded":        () => void;
  "draft:error":            (data: { message: string }) => void;
  "draft:activity-removed": (data: { tripDayId: string; activityIndex: number; removedBy: string }) => void;

  "error": (data: { message: string }) => void;
}

interface ClientToServerEvents {

  "trip:join": (tripId: string) => void;
  "trip:leave": (tripId: string) => void;
  "chat:sendMessage": (data: { tripId: string; content: string; type: 'text' | 'image' | 'file' }) => void;
  "chat:typing": (data: { tripId: string; userId: string; isTyping: boolean; name: string }) => void;
}

export type TypedSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
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
export interface ActivityExpenseSocketData {
  activityId: string;
  creatorId: string;
  creatorName: string | null;
  expense: Expense;
}

export interface ActivityExpenseDeletedSocketData {
  activityId: string;
  deletedById: string;
  deletedByName: string | null;
}

export interface TripDatesUpdatedData {
  tripId: string;
  startDate: string | null;
  endDate: string | null;
  updatedBy: {
    id: string;
    name: string;
  };
  timestamp: Date;
}