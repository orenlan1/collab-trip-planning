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

export const getChatHistory = (tripId: string, beforeDate?: string, limit: number = 100) => {
    const params = new URLSearchParams();
    if (beforeDate) {
      params.append('beforeDate', beforeDate);
    }
    params.append('limit', limit.toString());
    return api.get(`/api/trips/${tripId}/messages?${params.toString()}`);
  };

