import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";

export function useJoinTripSocket() {
    const { socket, isReady } = useSocket();
    const {tripId} = useParams<{ tripId: string }>();

    // Join trip room when socket is ready (for all trip pages)
    useEffect(() => {
        if (socket && isReady && tripId) {
        console.log(`TripSocket: Joining trip room: trip:${tripId}`);
        socket.emit('trip:join', tripId);

        return () => {
            console.log(`TripSocket: Leaving trip room: trip:${tripId}`);
            socket.emit('trip:leave', tripId);
        };
        }
    }, [socket, isReady, tripId]);

}