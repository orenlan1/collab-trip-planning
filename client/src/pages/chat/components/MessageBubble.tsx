import type { ChatMessage, ChatUser } from "@/types/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { linkify } from "@/lib/linkify";

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
      "flex gap-2.5 mb-3",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0 self-end mb-1">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full ring-2 ring-border overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt="" />
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-xs lg:max-w-md",
        isCurrentUser ? "items-end" : "items-start",
        "flex flex-col"
      )}>
        {/* User name (only for other users) */}
        {!isCurrentUser && (
          <div className="text-xs text-muted-foreground mb-1 px-1 font-medium">
            {user.name}
          </div>
        )}

        {/* Message bubble */}
        <div className={cn(
          "px-4 py-2.5 shadow-sm",
          isCurrentUser
            ? "bg-linear-to-br from-primary to-violet-500 text-white rounded-2xl rounded-br-sm"
            : "bg-card border border-border/70 text-foreground rounded-2xl rounded-bl-sm"
        )}>
          <p className="text-sm leading-relaxed break-words">
            {linkify(message.content, isCurrentUser)}
          </p>

          {/* Edited indicator */}
          {message.isEdited && (
            <span className={cn(
              "text-xs opacity-70 ml-2",
              isCurrentUser ? "text-white/70" : "text-muted-foreground"
            )}>
              (edited)
            </span>
          )}
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <div className={cn(
            "text-xs text-muted-foreground mt-1 px-1",
            isCurrentUser ? "text-right" : "text-left"
          )}>
            {format(new Date(message.createdAt), "HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
}
