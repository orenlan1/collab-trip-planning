import type { TypedSocket } from "../types";

export class TripHandler {

    constructor(
        private io: any,
        private tripConnections: Map<string, Map<string, Set<string>>> // tripId
    ) {}

    handleJoinTripRoom(socket: TypedSocket) {
        // Handle joining a specific trip chat room
        socket.on("trip:join", async (tripId: string) => {
            try {
            // TODO: Verify user is a member of this trip
            // You should check against your database here
            console.log(`User ${socket.data.userId} joining trip: ${tripId}`);
            
            // Leave any previous trip room (user can only be in one trip chat at a time)
            const rooms = Array.from(socket.rooms);
            const tripRooms = rooms.filter(room => room.startsWith('trip:'));
            tripRooms.forEach(room => socket.leave(room));
            
            // Get currently connected users in this trip room before joining
            const socketsInRoom = await this.io.in(`trip:${tripId}`).fetchSockets();
            // Deduplicate user IDs (same user might have multiple sockets/tabs)
            const connectedUserIds = [...new Set(socketsInRoom.map((s: any) => s.data.userId))] as string[];
            
            // Join the new trip room
            await socket.join(`trip:${tripId}`);
            
            // Store tripId in socket data for disconnect handler
            socket.data.tripId = tripId;
            
            // Track this connection
            if (!this.tripConnections.has(tripId)) {
                this.tripConnections.set(tripId, new Map());
            }
            const tripMap = this.tripConnections.get(tripId)!;
            if (!tripMap.has(socket.data.userId)) {
                tripMap.set(socket.data.userId, new Set());
            }
            const userSockets = tripMap.get(socket.data.userId)!;
            const isFirstConnection = userSockets.size === 0;
            userSockets.add(socket.id);
            
            console.log(`User ${socket.data.userId} now has ${userSockets.size} connection(s) to trip ${tripId}`);
            
            // Only notify others if this is the user's FIRST connection to this trip
            if (isFirstConnection) {
                console.log(`First connection for user ${socket.data.userId} to trip ${tripId}, notifying others`);
                socket.to(`trip:${tripId}`).emit("trip:userJoined", {
                    userId: socket.data.userId,
                    tripId,
                    timestamp: new Date()
                });
            }
            
            // Send the list of connected users to the joining user (including self)
            socket.emit("trip:joined", { 
                tripId,
                connectedUserIds: [...connectedUserIds, socket.data.userId]
            });
            
            } catch (error) {
            console.error("Error joining trip:", error);
            socket.emit("error", { message: "Failed to join trip" });
            }
        });
    }

    handleLeaveTripRoom(socket: TypedSocket) {
        // Handle leaving a trip chat room
        socket.on("trip:leave", (tripId: string) => {
            console.log(`User ${socket.data.userId} leaving trip: ${tripId}`);
            
            socket.leave(`trip:${tripId}`);
            
            // Remove this socket from tracking
            const tripMap = this.tripConnections.get(tripId);
            if (tripMap) {
                const userSockets = tripMap.get(socket.data.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    
                    // Only notify if this was the user's last connection
                    if (userSockets.size === 0) {
                        tripMap.delete(socket.data.userId);
                        socket.to(`trip:${tripId}`).emit("trip:userLeft", {
                            userId: socket.data.userId,
                            tripId,
                            timestamp: new Date()
                        });
                    }
                    
                    if (tripMap.size === 0) {
                        this.tripConnections.delete(tripId);
                    }
                }
            }
            
            // Clear tripId from socket data
            delete socket.data.tripId;
        });
    }

    register(socket: TypedSocket) {
        this.handleJoinTripRoom(socket);
        this.handleLeaveTripRoom(socket);
    }
}