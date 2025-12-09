import type { ChatMessage, SendMessagePayload, TypingIndicator } from "@/types/chat";
import type { Socket } from "socket.io-client";
import axios from "axios";

// Base API configuration
const CHAT_API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: CHAT_API_BASE_URL,
  withCredentials: true,
});

export const sendMessage = (tripId: string, payload: SendMessagePayload) => {
    return api.post(`/api/trips/${tripId}/messages`, {
        content: payload.content });
  }

export const getChatHistory = (tripId: string) => {
    return api.get(`/api/trips/${tripId}/messages`);
  };

// /**
//  * Leave a specific trip chat room
//  */
// export const leaveTripChat = (socket: Socket, tripId: string): void => {
//   if (socket.connected) {
//     console.log(`Leaving trip chat: ${tripId}`);
//     socket.emit('leaveTripChat', tripId);
//   }
// };

// /**
//  * Send a message via socket (for real-time lightweight events)
//  */
// export const sendMessageViaSocket = (
//   socket: Socket, 
//   tripId: string, 
//   payload: SendMessagePayload
// ): void => {
//   if (!socket.connected) {
//     throw new Error('Socket not connected');
//   }

//   console.log(`Sending message to trip ${tripId}:`, payload);
//   socket.emit('sendMessage', {
//     tripId,
//     content: payload.content,
//     type: payload.type
//   });
// };

// /**
//  * Send a message via HTTP API (recommended for reliability)
//  */
// export const sendMessageViaAPI = async (
//   tripId: string, 
//   payload: SendMessagePayload
// ): Promise<ChatMessage> => {
//   try {
//     const response = await fetch(`${CHAT_API_BASE_URL}/api/messages/${tripId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({
//         content: payload.content
//         // Backend only expects content field
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || 'Failed to send message');
//     }

//     const message = await response.json();
    
//     // Transform backend response to match our ChatMessage interface
//     return {
//       id: message.id,
//       senderId: message.senderId,
//       tripId: message.tripId,
//       content: message.content,
//       createdAt: new Date(message.createdAt),
//       updatedAt: message.updatedAt ? new Date(message.updatedAt) : undefined,
//       type: 'text' // Default to text since backend doesn't have type yet
//     };
//   } catch (error) {
//     console.error('Failed to send message:', error);
//     throw error;
//   }
// };

// /**
//  * Get chat history from API
//  */
// export const getChatHistory = async (
//   tripId: string
// ): Promise<ChatMessage[]> => {
//   try {
//     // Your backend route is GET /api/messages/:tripId 
//     // Add query params if you want to implement pagination later
//     const url = `${CHAT_API_BASE_URL}/api/messages/${tripId}`;
    
//     const response = await fetch(url, {
//       credentials: 'include',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.error || 'Failed to fetch chat history');
//     }

//     const messages = await response.json();
    
//     // Transform backend response to match our ChatMessage interface
//     return messages.map((message: any) => ({
//       id: message.id,
//       senderId: message.senderId,
//       tripId: message.tripId,
//       content: message.content,
//       createdAt: new Date(message.createdAt),
//       updatedAt: message.updatedAt ? new Date(message.updatedAt) : undefined,
//       type: 'text' // Default to text since backend doesn't have type yet
//     }));
//   } catch (error) {
//     console.error('Failed to fetch chat history:', error);
//     throw error;
//   }
// };

// /**
//  * Send typing indicator
//  */
// export const sendTypingIndicator = (
//   socket: Socket, 
//   tripId: string, 
//   isTyping: boolean
// ): void => {
//   if (socket.connected) {
//     socket.emit('typing', { tripId, isTyping });
//   }
// };

// /**
//  * Set up message listeners
//  */
// export const setupMessageListeners = (
//   socket: Socket,
//   onNewMessage: (message: ChatMessage) => void,
//   onUserTyping: (data: TypingIndicator & { tripId: string }) => void,
//   onUserJoined: (data: { userId: string; tripId: string; timestamp: Date }) => void,
//   onUserLeft: (data: { userId: string; tripId: string; timestamp: Date }) => void
// ) => {
//   socket.on('newMessage', onNewMessage);
//   socket.on('userTyping', onUserTyping);
//   socket.on('userJoinedChat', onUserJoined);
//   socket.on('userLeftChat', onUserLeft);

//   // Return cleanup function
//   return () => {
//     socket.off('newMessage', onNewMessage);
//     socket.off('userTyping', onUserTyping);
//     socket.off('userJoinedChat', onUserJoined);
//     socket.off('userLeftChat', onUserLeft);
//   };
// };

// /**
//  * Clean up all chat-related listeners
//  */
// export const cleanupChatListeners = (socket: Socket) => {
//   socket.off('newMessage');
//   socket.off('userTyping');
//   socket.off('userJoinedChat');
//   socket.off('userLeftChat');
//   socket.off('joinedTripChat');
//   socket.off('messageDelivered');
//   socket.off('error');
// };