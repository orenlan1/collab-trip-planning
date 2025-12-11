import React, { createContext, useEffect, useState, useContext } from 'react';
import { useSocket } from './SocketContext';
import { useParams } from 'react-router-dom';

interface TripSocketContextType {
    connectedUserIds: Set<string>;
}

const TripSocketContext = createContext<TripSocketContextType | null>(null);

export function TripSocketProvider({ children }: { children: React.ReactNode }) {
    const { socket, isReady } = useSocket();
    const { tripId } = useParams<{ tripId: string }>();
    const [connectedUserIds, setConnectedUserIds] = useState<Set<string>>(new Set());

    // Set up listeners FIRST, then join the trip
    useEffect(() => {
        if (!socket || !isReady || !tripId) return;

        const handleTripJoined = (data: { tripId: string; connectedUserIds: string[] }) => {
            console.log('TripSocket: Received trip:joined event:', data);
            if (data.tripId === tripId) {
                console.log('TripSocket: Setting connected users:', data.connectedUserIds);
                setConnectedUserIds(new Set(data.connectedUserIds));
            }
        };

        const handleUserJoined = (data: { userId: string; tripId: string; timestamp: Date }) => {
            console.log('TripSocket: User joined:', data);
            if (data.tripId === tripId) {
                setConnectedUserIds(prev => new Set(prev).add(data.userId));
            }
        };

        const handleUserLeft = (data: { userId: string; tripId: string; timestamp: Date }) => {
            console.log('TripSocket: User left:', data);
            if (data.tripId === tripId) {
                setConnectedUserIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        };

        const handleReconnect = () => {
            console.log('TripSocket: Socket reconnected, rejoining trip room');
            // Rejoin the trip room after reconnection
            socket.emit('trip:join', tripId);
        };

        // Register listeners FIRST
        socket.on('trip:joined', handleTripJoined);
        socket.on('trip:userJoined', handleUserJoined);
        socket.on('trip:userLeft', handleUserLeft);
        socket.on('connect', handleReconnect); // Listen for reconnections

        // THEN join the trip
        console.log(`TripSocket: Joining trip room: trip:${tripId}`);
        socket.emit('trip:join', tripId);

        return () => {
            console.log(`TripSocket: Leaving trip room: trip:${tripId}`);
            socket.off('trip:joined', handleTripJoined);
            socket.off('trip:userJoined', handleUserJoined);
            socket.off('trip:userLeft', handleUserLeft);
            socket.off('connect', handleReconnect);
            socket.emit('trip:leave', tripId);
            console.log('TripSocket: Cleaned up listeners and left trip room')
        };
    }, [socket, isReady, tripId]);

    return (
        <TripSocketContext.Provider value={{ connectedUserIds }}>
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
}
        