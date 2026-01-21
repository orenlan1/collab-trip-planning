import React, { useEffect, useRef } from "react";
import { TailSpin } from 'react-loader-spinner';
import { useTripChat } from "./hooks/useTripChat"; 
import { MessageBubble } from "@/pages/chat/components/MessageBubble";
import { ChatInput } from "@/pages/chat/components/ChatInput";
import { ChatHeader } from "@/pages/chat/components/ChatHeader";
import { TypingIndicator } from "@/pages/chat/components/TypingIndicator";
import { DateSeparator } from "@/pages/chat/components/DateSeparator";
import { useTripStore } from "@/stores/tripStore";
import { useAuth } from "@/context/AuthContext";
import { useTripSocket } from "@/context/TripChatSocketContext";
import { format } from "date-fns";

export function TripChatPage() {
  const tripId = useTripStore(state => state.id);
  const { user } = useAuth();
  const { markAsRead, setIsInChatPage } = useTripSocket();
  const { messages, connectionStatus, typingUser, sendMessage, emitTyping, loadMoreMessages, hasMoreMessages, isLoadingMore, isInitialLoading } = useTripChat({ tripId });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
        previousScrollHeightRef.current = container.scrollHeight;
        await loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || previousScrollHeightRef.current === 0) return;

    const newScrollHeight = container.scrollHeight;
    const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
    container.scrollTop = scrollDiff;
    previousScrollHeightRef.current = 0;
  }, [messages.length]);

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

  const shouldShowDateSeparator = (currentMessage: typeof messages[0], previousMessage: typeof messages[0] | undefined): boolean => {
    if (!previousMessage) return true;
    
    const currentDate = format(new Date(currentMessage.createdAt), "yyyy-MM-dd");
    const previousDate = format(new Date(previousMessage.createdAt), "yyyy-MM-dd");
    
    return currentDate !== previousDate;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 rounded-lg overflow-hidden ">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {isInitialLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
            <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-2">Start a conversation by sending a message!</p>
            </div>
          </div>
        ) : (
          <>
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <TailSpin height="30" width="30" color="#4F46E5" ariaLabel="loading-more" />
              </div>
            )}
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === user?.id;
              const previousMessage = messages[index - 1];
              const showAvatar = !previousMessage || 
                previousMessage.senderId !== message.senderId ||
                new Date(message.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() > 300000; // 5 minutes
              const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <DateSeparator date={new Date(message.createdAt)} />
                  )}
                  <MessageBubble
                    message={message}
                    user={message.sender}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    showTimestamp={true}
                  />
                </React.Fragment>
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
