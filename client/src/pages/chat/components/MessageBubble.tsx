import type { ChatMessage, ChatUser } from "@/types/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: ChatMessage;
  user: ChatUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export function MessageBubble({ 
  message, 
  user, 
  isCurrentUser, 
  showAvatar = true,
  showTimestamp = true 
}: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full ring-1 ring-neutral-200 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt="" />
              {/* {user.name.charAt(0).toUpperCase()} */}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-xs lg:max-w-md",
        isCurrentUser ? "ml-auto" : "mr-auto"
      )}>
        {/* User name (only for other users) */}
        {!isCurrentUser && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {user.name}
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "px-4 py-2 rounded-lg shadow-sm",
          isCurrentUser 
            ? "bg-blue-500 text-white rounded-br-sm" 
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        )}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Edited indicator */}
          {message.isEdited && (
            <span className={cn(
              "text-xs opacity-70 ml-2",
              isCurrentUser ? "text-blue-100" : "text-gray-500"
            )}>
              (edited)
            </span>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            "text-xs text-gray-500 mt-1 px-1",
            isCurrentUser ? "text-right" : "text-left"
          )}>
            {format(new Date(message.createdAt), "HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
}