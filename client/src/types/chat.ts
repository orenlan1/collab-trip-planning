export interface ChatUser {
  name: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // Match backend field name
  tripId: string;   // Match backend field name
  content: string;
  createdAt: Date;  // Match backend field name (Prisma default)
  updatedAt?: Date; // Match backend field name (Prisma default)
  type?: 'text' | 'image' | 'file'; // Optional since backend doesn't have this yet
  isEdited?: boolean;
  replyTo?: string; // ID of message being replied to
  sender: ChatUser; // Include sender details
}

export interface ChatState {
  messages: ChatMessage[];
  users: ChatUser[];
  currentUserId: string;
  isTyping: Record<string, boolean>; // userId -> isTyping
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface SendMessagePayload {
  content: string;
  type?: 'text' | 'image' | 'file'; // Optional since backend only requires content
  replyTo?: string;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}