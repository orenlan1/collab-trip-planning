import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useTripStore } from "@/stores/tripStore";
import { useAuth } from "./AuthContext";
import { notifySuccess } from "@/layouts/TripLayout";
import { useParams } from "react-router-dom";
import type { ActivitySocketData, ActivityDeletedSocketData } from "@/sockets/types";


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

    socket.on('activity:created', handleNewActivity);
    socket.on('activity:updated', handleUpdatedActivity);
    socket.on('activity:deleted', handleDeletedActivity);

    return () => {
      socket.off('activity:created', handleNewActivity);
      socket.off('activity:updated', handleUpdatedActivity);
      socket.off('activity:deleted', handleDeletedActivity);
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