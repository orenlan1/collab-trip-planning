import type { TypedSocket } from "../types";

export class ChatHandler {
    constructor(private io: any) {}

    handleSendMessage(socket: TypedSocket) {
        socket.on("chat:sendMessage", async (data: {
                tripId: string;
                content: string;
                type: 'text' | 'image' | 'file';
            }) => {
            try {
            // TODO: Save message to database
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: socket.data.userId,
                tripId: data.tripId,
                content: data.content,
                type: data.type,
                timestamp: new Date()
            };
            
            console.log(`Message from user ${socket.data.userId} in trip ${data.tripId}:`, data.content);
            
            // Broadcast message to all users in the trip room
            socket.to(`trip:${data.tripId}`).emit("chat:newMessage", message);
            
            // Send confirmation back to sender
            socket.emit("chat:messageDelivered", { messageId: message.id });
            
            } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
            }
        });
    }

    handleTypingIndicator(socket: TypedSocket) {
         // Handle typing indicators
        socket.on("chat:typing", (data: { tripId: string; isTyping: boolean; name: string }) => {
            socket.to(`trip:${data.tripId}`).emit("chat:userTyping", {
            userId: socket.data.userId,
            isTyping: data.isTyping,
            tripId: data.tripId,
            name: data.name
            });
        });
    }


    register(socket: TypedSocket) {
        this.handleSendMessage(socket);
        this.handleTypingIndicator(socket);

    }
}