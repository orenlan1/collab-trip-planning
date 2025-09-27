import type { ChatUser } from "@/types/chat";

interface TypingIndicatorProps {
  user: ChatUser | null;
}

export function TypingIndicator({ user }: TypingIndicatorProps) {
  if (!user) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
        <span>{user.name} is typing...</span>
      </div>
    </div>
  );
}