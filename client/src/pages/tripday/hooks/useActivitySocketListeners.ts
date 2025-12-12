import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";
import type { ActivitySocketData, ActivityDeletedSocketData, ActivityExpenseSocketData, ActivityExpenseDeletedSocketData } from "@/sockets/types";
import { useTripDayStore } from "@/stores/tripDayStore";
import { useAuth } from "@/context/AuthContext";
import { useActivityAnimation } from "./useActivityAnimation";

export function useActivitySocketListeners(currentTripDayId: string) {
    const { socket, isReady } = useSocket();
    const { addActivity, updateActivity, removeActivity, updateActivityExpense } = useTripDayStore();
    const { user } = useAuth();
    const { animatedActivityIds, animateActivity } = useActivityAnimation();

    useEffect(() => {
        if (!socket || !isReady) return;

        const handleNewActivity = (data: ActivitySocketData) => {
            if (data.tripDayId === currentTripDayId) {
                if (data.creatorId !== user?.id) {
                    addActivity(data.activity);
                    animateActivity(data.activity.id);
                }
            }
        }

        const handleUpdatedActivity = (data: ActivitySocketData) => {
            if (data.tripDayId === currentTripDayId) {                
                if (data.creatorId !== user?.id) {
                    updateActivity(data.activity.id, data.activity);
                    animateActivity(data.activity.id);
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

        const handleActivityExpenseCreated = (data: ActivityExpenseSocketData) => {
            updateActivityExpense(data.activityId, data.expense);
            animateActivity(data.activityId);
        }

        const handleActivityExpenseUpdated = (data: ActivityExpenseSocketData) => {
            updateActivityExpense(data.activityId, data.expense);
            animateActivity(data.activityId);
        }

        const handleActivityExpenseDeleted = (data: ActivityExpenseDeletedSocketData) => {
            updateActivityExpense(data.activityId, null);
            animateActivity(data.activityId);
        }

        socket.on('activity:created', handleNewActivity);
        socket.on('activity:updated', handleUpdatedActivity);
        socket.on('activity:deleted', handleDeletedActivity);
        socket.on('activity:expense:created', handleActivityExpenseCreated);
        socket.on('activity:expense:updated', handleActivityExpenseUpdated);
        socket.on('activity:expense:deleted', handleActivityExpenseDeleted);

        return () => {
            socket.off('activity:created', handleNewActivity);
            socket.off('activity:updated', handleUpdatedActivity);
            socket.off('activity:deleted', handleDeletedActivity);
            socket.off('activity:expense:created', handleActivityExpenseCreated);
            socket.off('activity:expense:updated', handleActivityExpenseUpdated);
            socket.off('activity:expense:deleted', handleActivityExpenseDeleted);
        };
    }, [socket, isReady, currentTripDayId, addActivity, updateActivity, removeActivity, updateActivityExpense, animateActivity, user?.id]);

    return { animatedActivityIds };
}