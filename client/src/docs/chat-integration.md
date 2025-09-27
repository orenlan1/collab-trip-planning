# Chat Integration Guide

This document explains how to integrate the chat UI with your real-time chat API.

## Overview

The chat system is designed with separation of concerns:
- **UI Components**: Reusable chat interface components
- **State Management**: Custom hooks for managing chat state
- **API Service**: Service layer for API communication
- **Mock Data**: Sample data for development and testing

## Files Structure

```
src/
├── components/chat/
│   ├── MessageBubble.tsx      # Individual message display
│   ├── ChatInput.tsx          # Message input with typing indicators
│   ├── ChatHeader.tsx         # Chat header with user info
│   └── TypingIndicator.tsx    # Shows who is currently typing
├── hooks/
│   ├── useChat.ts            # Mock-only chat hook
│   └── useChatWithAPI.ts     # Production-ready hook with API integration
├── services/
│   └── chatService.ts        # API service layer (contains TODOs for real implementation)
├── types/
│   └── chat.ts              # TypeScript interfaces
├── data/
│   └── mockChatData.ts      # Sample chat data for development
└── pages/trips/
    └── TripChatPage.tsx     # Main chat page component
```

## Integration Steps

### 1. Backend API Requirements

Your backend should provide these endpoints:

```typescript
// Get chat history
GET /api/trips/:tripId/messages?limit=50&offset=0
Response: ChatMessage[]

// Send a message
POST /api/trips/:tripId/messages
Body: SendMessagePayload
Response: ChatMessage

// WebSocket connection for real-time updates
WS /chat/:tripId?userId=:userId
```

### 2. Update Environment Variables

Add to your `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 3. Implement ChatService

In `src/services/chatService.ts`, replace the TODO sections with actual implementations:

#### WebSocket Connection
```typescript
async connect(tripId: string, userId: string): Promise<void> {
  this.socket = new WebSocket(`${WEBSOCKET_URL}/chat/${tripId}?userId=${userId}`);
  
  this.socket.onopen = () => {
    this.notifyConnectionStatus('connected');
  };

  this.socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    this.handleIncomingMessage(data);
  };

  this.socket.onclose = () => {
    this.notifyConnectionStatus('disconnected');
  };
}
```

#### API Calls
```typescript
async sendMessage(tripId: string, payload: SendMessagePayload): Promise<ChatMessage> {
  const response = await fetch(`${CHAT_API_BASE_URL}/api/trips/${tripId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return await response.json();
}
```

### 4. Switch to Production Mode

In your chat page, change from mock mode to production mode:

```typescript
// In TripChatPage.tsx, replace useChat with:
import { useChatWithAPI } from "@/hooks/useChatWithAPI";

export function TripChatPage() {
  const {
    messages,
    users,
    // ... other properties
  } = useChatWithAPI({
    tripId: "your-trip-id",
    userId: "current-user-id", 
    useMockData: false // Switch to false for production
  });
  
  // ... rest of component
}
```

### 5. Authentication Integration

Implement the `getAuthToken()` function in `chatService.ts`:

```typescript
function getAuthToken(): string {
  // Example using your auth context
  const token = localStorage.getItem('authToken');
  return token || '';
}
```

## Message Flow

### Sending Messages
1. User types in `ChatInput`
2. `onSendMessage` calls `sendMessage` from hook
3. Hook calls `chatService.sendMessage()`
4. Service sends to API and updates local state
5. WebSocket broadcasts to other users

### Receiving Messages
1. WebSocket receives message from server
2. `chatService.onMessage` handlers are called
3. Hook updates state with new message
4. UI automatically re-renders with new message

### Typing Indicators
1. User types in input → calls `updateTypingStatus(true)`
2. Service sends typing indicator via WebSocket
3. Other users receive typing updates
4. UI shows typing indicator

## Error Handling

The system includes error handling for:
- Connection failures
- API request failures
- WebSocket disconnections
- Message send failures

## Development vs Production

### Development (Mock Mode)
- Set `useMockData: true`
- Uses sample data from `mockChatData.ts`
- No API calls required
- Perfect for UI development

### Production (API Mode)
- Set `useMockData: false`
- Requires backend API implementation
- Real-time updates via WebSocket
- Full chat functionality

## Customization

### Styling
- Components use Tailwind CSS classes
- Easily customizable through className props
- Responsive design included

### Message Types
- Currently supports text messages
- Easily extensible for images, files, etc.
- Type safety through TypeScript interfaces

### User Management
- Supports multiple users per chat
- Online/offline status tracking
- User avatars and names

## Testing

The mock data includes:
- Two users (Alice and Bob)
- Sample conversation about trip planning
- Various message timestamps
- Online status indicators

Perfect for development and testing without backend dependencies.