import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";
import type { ActivitySocketData, ActivityDeletedSocketData } from "@/sockets/types";
import { useTripDayStore } from "@/stores/tripDayStore";
import { useAuth } from "@/context/AuthContext";

export function useActivitySocketListeners(currentTripDayId: string) {
    const { socket, isReady } = useSocket();
    const { addActivity, updateActivity, removeActivity } = useTripDayStore();
    const { user } = useAuth();
    const [animatedActivityIds, setAnimatedActivityIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!socket || !isReady) return;

        const handleNewActivity = (data: ActivitySocketData) => {
            if (data.tripDayId === currentTripDayId) {
                if (data.creatorId !== user?.id) {
                    addActivity(data.activity);
                    setAnimatedActivityIds(prev => new Set(prev).add(data.activity.id));
                    setTimeout(() => {
                        setAnimatedActivityIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(data.activity.id);
                            return newSet;
                        });
                    }, 1000);
                }
            }
        }

        const handleUpdatedActivity = (data: ActivitySocketData) => {
            if (data.tripDayId === currentTripDayId) {                
                if (data.creatorId !== user?.id) {
                    updateActivity(data.activity.id, data.activity);
                    setAnimatedActivityIds(prev => new Set(prev).add(data.activity.id));
                    setTimeout(() => {
                        setAnimatedActivityIds(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(data.activity.id);
                            return newSet;
                        });
                    }, 1000);
                }
            }
        }

        const handleDeletedActivity = (data: ActivityDeletedSocketData) => {
            if (data.tripDayId === currentTripDayId) {
                if (data.deletedById !== user?.id) {             
                    removeActivity(data.activityId);
                }
            }
        }

        socket.on('activity:created', handleNewActivity);
        socket.on('activity:updated', handleUpdatedActivity);
        socket.on('activity:deleted', handleDeletedActivity);

        return () => {
            socket.off('activity:created', handleNewActivity);
            socket.off('activity:updated', handleUpdatedActivity);
            socket.off('activity:deleted', handleDeletedActivity);
        };
    }, [socket, isReady, currentTripDayId, addActivity, updateActivity, removeActivity, user?.id]);

    return { animatedActivityIds };
}