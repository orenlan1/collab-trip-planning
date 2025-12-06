import { use, useEffect, useRef } from "react";
import { TailSpin } from 'react-loader-spinner';
import { useTripChat } from "./hooks/useTripChat"; 
import { MessageBubble } from "@/pages/chat/components/MessageBubble";
import { ChatInput } from "@/pages/chat/components/ChatInput";
import { ChatHeader } from "@/pages/chat/components/ChatHeader";
import { TypingIndicator } from "@/pages/chat/components/TypingIndicator";
import { useTripStore } from "@/stores/tripStore";
import { useAuth } from "@/context/AuthContext";
import { useTripSocket } from "@/context/TripSocketContext";

export function TripChatPage() {
  const tripId = useTripStore(state => state.id);
  const { user } = useAuth();
  const { markAsRead, setIsInChatPage } = useTripSocket();
  const { messages, connectionStatus, typingUser, sendMessage, emitTyping } = useTripChat({ tripId });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    useEffect(() => {
      setIsInChatPage(true);
      markAsRead();

      return () => {
        setIsInChatPage(false);
      };
  }, [markAsRead, setIsInChatPage]);


  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  const handleTyping = (isTyping: boolean) => {
    emitTyping(isTyping);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
            <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === user?.id;
              const previousMessage = messages[index - 1];
              const showAvatar = !previousMessage || 
                previousMessage.senderId !== message.senderId ||
                new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() > 300000; // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  user={message.sender}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  showTimestamp={true}
                />
              );
            })}
            {/* Typing Indicator */}
            <TypingIndicator user={typingUser} />
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={connectionStatus !== "connected"}
        placeholder={
          connectionStatus === "connected" 
            ? "Type a message..." 
            : "Connecting..."
        }
      />
      
      {/* Connection Status Banner */}
      {connectionStatus !== "connected" && (
        <div className="bg-yellow-100 border-t border-yellow-200 px-4 py-2 text-center">
          <span className="text-yellow-800 text-sm">
            {connectionStatus === "connecting" 
              ? "Connecting to chat..." 
              : "Disconnected from chat. Trying to reconnect..."
            }
          </span>
        </div>
      )}
    </div>
  );
}
