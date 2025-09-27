# Chat System - Socket Events

## Frontend Events (Emitted by Client)

### `typing`
**Payload:**
```typescript
{
  tripId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

**Usage:** Sent when user starts/stops typing

### `joinTripChat`
**Payload:** `tripId: string`

**Usage:** Join a specific trip chat room

## Backend Events (Emitted by Server)

### `userTyping`
**Payload:**
```typescript
{
  tripId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
```

**Usage:** Broadcast to other users in the trip when someone is typing

### `newMessage`
**Payload:**
```typescript
{
  id: string;
  tripId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    name: string;
    image?: string;
  };
}
```

**Usage:** Broadcast new message to all users in the trip

## Backend Implementation Example

```typescript
// In your socket handler
socket.on('typing', (data) => {
  // Broadcast to other users in the same trip
  socket.to(data.tripId).emit('userTyping', data);
});

socket.on('joinTripChat', (tripId) => {
  socket.join(tripId);
});
```