import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useDraftStore } from '@/stores/draftStore';

export function useDraftSocketListeners(onAccepted?: () => void, onDiscarded?: () => void) {
    const { socket } = useSocket();
    const { appendDay, setDraft, clearDraft, removeActivity } = useDraftStore();

    useEffect(() => {
        if (!socket) return;

        socket.on('draft:day-ready', ({ day }) => {
            appendDay(day);
        });

        socket.on('draft:ready', () => {
            useDraftStore.getState().setGenerating(false);
        });

        socket.on('draft:accepted', () => {
            clearDraft();
            onAccepted?.();
        });

        socket.on('draft:discarded', () => {
            clearDraft();
            onDiscarded?.();
        });

        socket.on('draft:error', ({ message }) => {
            useDraftStore.getState().setError(message);
        });

        // Remote peer removes an activity — sync locally
        socket.on('draft:activity-removed', ({ tripDayId, activityIndex }) => {
            removeActivity(tripDayId, activityIndex);
        });

        return () => {
            socket.off('draft:day-ready');
            socket.off('draft:ready');
            socket.off('draft:accepted');
            socket.off('draft:discarded');
            socket.off('draft:error');
            socket.off('draft:activity-removed');
        };
    }, [socket, appendDay, setDraft, clearDraft, removeActivity, onAccepted, onDiscarded]);
}
