import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, ChatUser } from "@/types/chat";
import { useSocket } from "@/context/SocketContext";
import { sendMessage, getChatHistory } from "../services/chatService";
import { useAuth } from "@/context/AuthContext";

interface UseTripChatOptions {
  tripId: string;
}

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export function useTripChat({ tripId }: UseTripChatOptions) {
    const { socket, isReady } = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [typingUser, setTypingUser] = useState<ChatUser | null>(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Set connection status based on socket state
    useEffect(() => {
        if (socket && isReady) {
            setConnectionStatus("connected");
        } else {
            setConnectionStatus("disconnected");
        }
    }, [socket, isReady]);

    const loadMessages = useCallback(async (beforeDate?: string) => {
        try {
            const response = await getChatHistory(tripId, beforeDate, 100);
            for (const message of response.data) {
                message.createdAt = new Date(message.createdAt);
            }
            
            if (response.data.length < 100) {
                setHasMoreMessages(false);
            }
            
            return response.data;
        } catch (error) {
            console.error("Failed to load chat history:", error);
            return [];
        }
    }, [tripId]);

    useEffect(() => {
        const fetchInitialMessages = async () => {
            setIsInitialLoading(true);
            const initialMessages = await loadMessages();
            setMessages(initialMessages);
            setIsInitialLoading(false);
        };
        fetchInitialMessages();
    }, [loadMessages]);

    // Listen for new messages and typing events from socket
    useEffect(() => {
        if (!socket || !isReady) return;

        const handleNewMessage = (message: ChatMessage) => {
            if (message.senderId === user?.id) return; // Ignore own messages
            message.createdAt = new Date(message.createdAt);
            setMessages(prev => [...prev, message]);
        };

        const handleUserTyping = (data: { userId: string; name: string; isTyping: boolean; tripId: string }) => {
            if (data.tripId !== tripId || data.userId === user?.id) return; // Ignore own typing and other trips
            
            if (data.isTyping) {
                setTypingUser({ name: data.name, image: undefined });
            } else {
                setTypingUser(null);
            }
        };

        socket.on('chat:newMessage', handleNewMessage);
        socket.on('chat:userTyping', handleUserTyping);

        return () => {
            socket.off('chat:newMessage', handleNewMessage);
            socket.off('chat:userTyping', handleUserTyping);
        };
    }, [socket, isReady, tripId, user?.id]);

    // Send message function
    const handleSendMessage = useCallback(async (content: string) => {
        try {
            const response = await sendMessage(tripId, { content });         
            const newMessage: ChatMessage = {
                id: response.data.id,
                senderId: user?.id || '',
                tripId: tripId,
                content: content,
                createdAt: new Date(response.data.createdAt),
                type: 'text',
                sender: response.data.sender
            };
            setMessages(prev => [...prev, newMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }, [tripId, user?.id]);

    // Send typing indicator
    const handleTyping = useCallback((isTyping: boolean) => {
        if (socket && isReady && user?.name) {
            socket.emit('chat:typing', {
                tripId,
                userId: user.id,
                name: user.name,
                isTyping
            });
        }
    }, [socket, isReady, tripId, user?.id, user?.name]);

    const loadMoreMessages = useCallback(async () => {
        if (!hasMoreMessages || isLoadingMore || messages.length === 0) return;
        
        setIsLoadingMore(true);
        const oldestMessage = messages[0];
        const olderMessages = await loadMessages(oldestMessage.createdAt.toISOString());
        
        if (olderMessages.length > 0) {
            setMessages(prev => [...olderMessages, ...prev]);
        }
        
        setIsLoadingMore(false);
    }, [hasMoreMessages, isLoadingMore, messages, loadMessages]);

    return {
        messages,
        connectionStatus,
        typingUser,
        sendMessage: handleSendMessage,
        emitTyping: handleTyping,
        loadMoreMessages,
        hasMoreMessages,
        isLoadingMore,
        isInitialLoading
    };
}