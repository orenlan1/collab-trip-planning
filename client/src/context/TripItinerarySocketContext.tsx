import { createContext, useContext, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { notifySuccess } from "@/layouts/TripLayout";
import { useParams } from "react-router-dom";
import type { ActivitySocketData, ActivityDeletedSocketData, ActivityExpenseSocketData, ActivityExpenseDeletedSocketData } from "@/sockets/types";


interface TripItinerarySocketContextType {
}

const TripItinerarySocketContext = createContext<TripItinerarySocketContextType | null>(null);

export function TripItinerarySocketProvider({ children }: { children: React.ReactNode }) {
  const { socket, isReady } = useSocket();
  const { user } = useAuth();
  const {tripId} = useParams<{ tripId: string }>();


  // Listen for new activities across all trip pages
  useEffect(() => {
    if (!socket || !isReady || !tripId) {
      return;
    }

    const handleNewActivity = (data: ActivitySocketData) => {  
      notifySuccess(`${data.creatorName} added a new activity: ${data.activity.name}`);
    };

    const handleUpdatedActivity = (data: ActivitySocketData) => {
      if (!data.excludeNotification) {
        notifySuccess(`${data.creatorName} updated an activity: ${data.activity.name}`);
      }
    };

    const handleDeletedActivity = (data: ActivityDeletedSocketData) => {
      notifySuccess(`${data.deletedByName} deleted an activity`);
    };

    const handleExpenseCreated = (data: ActivityExpenseSocketData) => {
      if (data.creatorId !== user?.id) {
        notifySuccess(`${data.creatorName} added an expense: ${data.expense.description}`);
      }
    };

    const handleExpenseUpdated = (data: ActivityExpenseSocketData) => {
      if (data.creatorId !== user?.id) {
        notifySuccess(`${data.creatorName} updated an expense: ${data.expense.description}`);
      }
    };

    const handleExpenseDeleted = (data: ActivityExpenseDeletedSocketData) => {
      if (data.deletedById !== user?.id) {
        notifySuccess(`${data.deletedByName} deleted an expense`);
      }
    };

    socket.on('activity:created', handleNewActivity);
    socket.on('activity:updated', handleUpdatedActivity);
    socket.on('activity:deleted', handleDeletedActivity);
    socket.on('activity:expense:created', handleExpenseCreated);
    socket.on('activity:expense:updated', handleExpenseUpdated);
    socket.on('activity:expense:deleted', handleExpenseDeleted);

    return () => {
      socket.off('activity:created', handleNewActivity);
      socket.off('activity:updated', handleUpdatedActivity);
      socket.off('activity:deleted', handleDeletedActivity);
      socket.off('activity:expense:created', handleExpenseCreated);
      socket.off('activity:expense:updated', handleExpenseUpdated);
      socket.off('activity:expense:deleted', handleExpenseDeleted);
    };
  }, [socket, isReady, tripId, user]);



  return (
    <TripItinerarySocketContext.Provider value={null}>
      {children}
    </TripItinerarySocketContext.Provider>
  );
}

export const useTripItinerarySocket = () => {
  const context = useContext(TripItinerarySocketContext);
  if (!context) {
    throw new Error('useTripItinerarySocket must be used within a TripItinerarySocketProvider');
  }
  return context;
};