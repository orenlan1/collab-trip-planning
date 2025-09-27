import type { ChatMessage, ChatUser, ChatState } from "@/types/chat";

// Mock users
export const mockUsers: ChatUser[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: "user-2", 
    name: "Bob Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
];

// Mock messages - a conversation about planning a trip
export const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "user-1",
    tripId: "trip-1",
    content: "Hey Bob! Are you excited about our upcoming trip to Tokyo?",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: "text",
  },
  {
    id: "msg-2", 
    senderId: "user-2",
    tripId: "trip-1",
    content: "Absolutely! I can't wait. Have you looked into the hotel bookings yet?",
    createdAt: new Date(Date.now() - 1000 * 60 * 28), // 28 minutes ago
    type: "text",
  },
  {
    id: "msg-3",
    senderId: "user-1", 
    tripId: "trip-1",
    content: "Yes, I found a few great options in Shibuya. The one near the crossing looks amazing! 🏨",
    createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    type: "text",
  },
  {
    id: "msg-4",
    senderId: "user-2",
    tripId: "trip-1",
    content: "Perfect! That's exactly the area I was hoping for. What about flights?",
    createdAt: new Date(Date.now() - 1000 * 60 * 22), // 22 minutes ago
    type: "text",
  },
  {
    id: "msg-5",
    senderId: "user-1",
    tripId: "trip-1",
    content: "I'm still comparing prices. The direct flight is more expensive but saves us 6 hours of travel time.",
    createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    type: "text",
  },
  {
    id: "msg-6",
    senderId: "user-2", 
    tripId: "trip-1",
    content: "I think the direct flight is worth it. We'll be less tired and have more time to explore!",
    createdAt: new Date(Date.now() - 1000 * 60 * 18), // 18 minutes ago
    type: "text",
  },
  {
    id: "msg-7",
    senderId: "user-1",
    tripId: "trip-1",
    content: "Good point! I'll book the direct flights then. Should I get seats together?",
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    type: "text",
  },
  {
    id: "msg-8",
    senderId: "user-2",
    tripId: "trip-1",
    content: "Yes please! Window seat if possible 😊",
    createdAt: new Date(Date.now() - 1000 * 60 * 12), // 12 minutes ago
    type: "text",
  },
  {
    id: "msg-9",
    senderId: "user-1",
    tripId: "trip-1",
    content: "Done! I just booked everything. We're all set for our Tokyo adventure! ✈️🗼",
    createdAt: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    type: "text",
  },
  {
    id: "msg-10",
    senderId: "user-2",
    tripId: "trip-1",
    content: "You're the best! I can't wait to try authentic ramen and visit all the temples 🍜⛩️",
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    type: "text",
  },
  {
    id: "msg-11",
    senderId: "user-1",
    tripId: "trip-1",
    content: "Same here! I've been researching the best spots. Tokyo is going to be incredible!",
    createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    type: "text",
  },
];

// Current user ID (Bob in this mock scenario)
export const currentUserId = "user-2";

// Initial chat state
export const mockChatState: ChatState = {
  messages: mockMessages,
  users: mockUsers,
  currentUserId,
  isTyping: {},
  connectionStatus: "connected",
};

// Helper function to get user by ID
export const getUserById = (userId: string): ChatUser | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// Helper function to add a new message
export const createNewMessage = (
  content: string, 
  senderId: string = currentUserId,
  tripId: string = "trip-1"
): ChatMessage => {
  return {
    id: `msg-${Date.now()}`,
    senderId,
    tripId,
    content,
    createdAt: new Date(),
    type: "text",
  };
};