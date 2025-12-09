import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useTripStore } from "@/stores/tripStore";
import { useAuth } from "./AuthContext";
import type { ChatMessage } from "@/types/chat";
import { useParams } from "react-router-dom";

interface TripSocketContextType {
  unreadCount: number;
  lastMessage: ChatMessage | null;
  markAsRead: () => void;
  isInChatPage: boolean;
  setIsInChatPage: (value: boolean) => void;
}

const TripSocketContext = createContext<TripSocketContextType | null>(null);

export function TripChatSocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, isReady } = useSocket();
  const { user } = useAuth();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
  const [isInChatPage, setIsInChatPage] = useState(false);


  // Listen for new messages across all trip pages
  useEffect(() => {
    if (!socket || !isReady) return;

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

    socket.on('chat:newMessage', handleNewMessage);

    return () => {
      socket.off('chat:newMessage', handleNewMessage);
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