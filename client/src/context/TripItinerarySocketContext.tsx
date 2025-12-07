import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useTripStore } from "@/stores/tripStore";
import { useAuth } from "./AuthContext";
import type { ChatMessage } from "@/types/chat";

interface TripItinerarySocketContextType {
  unreadCount: number;
  lastMessage: ChatMessage | null;
  markAsRead: () => void;
  isInChatPage: boolean;
  setIsInChatPage: (value: boolean) => void;
}

const TripItinerarySocketContext = createContext<TripItinerarySocketContextType | null>(null);

export function TripItinerarySocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, isReady } = useSocket();
  const tripId = useTripStore(state => state.id);


  // Join trip room when socket is ready (for all trip pages)
  useEffect(() => {
    if (socket && isReady && tripId) {
      console.log(`Joining trip room: ${tripId}`);
      socket.emit('joinTripChat', tripId);

      return () => {
        console.log(`Leaving trip room: ${tripId}`);
        socket.emit('leaveTripChat', tripId);
      };
    }
  }, [socket, isReady, tripId]);

  // Listen for new messages across all trip pages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      console.log('New message received:', message);
      
      // Don't count messages from current user
      if (message.senderId === user?.id) return;
      
      // Don't increment unread if user is actively in chat page
      if (!isInChatPage) {
        setUnreadCount(prev => prev + 1);
      }
      
      setLastMessage(message);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, user?.id, isInChatPage]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <TripSocketContext.Provider value={{
      unreadCount,
      lastMessage,
      markAsRead,
      isInChatPage,
      setIsInChatPage
    }}>
      {children}
    </TripSocketContext.Provider>
  );
}

export const useTripSocket = () => {
  const context = useContext(TripSocketContext);
  if (!context) {
    throw new Error('useTripSocket must be used within a TripSocketProvider');
  }
  return context;
};