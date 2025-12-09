import type { TypedSocket } from "../types";

export class TripHandler {

    constructor(private io: any) {}

    handleJoinTripRoom(socket: TypedSocket) {
        // Handle joining a specific trip chat room
        socket.on("trip:join", async (tripId: string) => {
            try {
            // TODO: Verify user is a member of this trip
            // You should check against your database here
            console.log(`User ${socket.data.userId} joining trip chat: ${tripId}`);
            
            // Leave any previous trip room (user can only be in one trip chat at a time)
            const rooms = Array.from(socket.rooms);
            const tripRooms = rooms.filter(room => room.startsWith('trip:'));
            tripRooms.forEach(room => socket.leave(room));
            
            // Join the new trip room
            await socket.join(`trip:${tripId}`);
            
            // Notify others in the room that user joined
            socket.to(`trip:${tripId}`).emit("trip::userJoined", {
                userId: socket.data.userId,
                tripId,
                timestamp: new Date()
            });
            
            // Confirm to the user they joined successfully
            socket.emit("trip:joined", { tripId });
            
            } catch (error) {
            console.error("Error joining trip chat:", error);
            socket.emit("error", { message: "Failed to join trip chat" });
            }
        });
    }

    handleLeaveTripRoom(socket: TypedSocket) {
        // Handle leaving a trip chat room
        socket.on("trip:leave", (tripId: string) => {
            console.log(`User ${socket.data.userId} leaving trip chat: ${tripId}`);
            
            socket.leave(`trip:${tripId}`);
            
            // Notify others in the room that user left
            socket.to(`trip:${tripId}`).emit("trip::userLeft", {
            userId: socket.data.userId,
            tripId,
            timestamp: new Date()
            });
        });
    }

    register(socket: TypedSocket) {
        this.handleJoinTripRoom(socket);
        this.handleLeaveTripRoom(socket);
    }
}