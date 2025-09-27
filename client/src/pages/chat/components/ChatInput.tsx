import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping,
  placeholder = "Type a message...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      // Stop typing when message is sent
      if (isTyping) {
        setIsTyping(false);
        onTyping?.(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (onTyping) {
      const hasContent = value.trim().length > 0;
      
      if (hasContent && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      if (hasContent) {
        typingTimeoutRef.current = window.setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 2000);
      } else if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Message input */}
        <div className="flex-1">
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>

        {/* Send button */}
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "flex-shrink-0",
            message.trim() ? "bg-blue-500 hover:bg-blue-600" : ""
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}