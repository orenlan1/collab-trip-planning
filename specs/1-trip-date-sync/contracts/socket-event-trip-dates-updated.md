# Socket.io Event Contract: trip:datesUpdated

**Event Name**: `trip:datesUpdated`  
**Direction**: Server → Client  
**Protocol**: Socket.io WebSocket  
**Feature**: 1-trip-date-sync

---

## Event Overview

**Purpose**: Notify all connected users in a trip room when the trip's start or end dates are modified.

**Trigger**: Successful PATCH request to `/api/trips/:id` that includes `startDate` or `endDate` in the request body.

**Room**: `trip:{tripId}` (only users who have joined the specific trip room receive this event)

---

## Event Specification

### Event Name
```
trip:datesUpdated
```

### Payload Structure

**TypeScript Type**:
```typescript
interface TripDatesUpdatedData {
  tripId: string;
  startDate: string | null;
  endDate: string | null;
  updatedBy: {
    id: string;
    name: string;
  };
  timestamp: Date;
}
```

**JSON Schema**:
```json
{
  "type": "object",
  "required": ["tripId", "startDate", "endDate", "updatedBy", "timestamp"],
  "properties": {
    "tripId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier of the trip that was updated"
    },
    "startDate": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "New trip start date in ISO 8601 format, or null if unset"
    },
    "endDate": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "New trip end date in ISO 8601 format, or null if unset"
    },
    "updatedBy": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": {
          "type": "string",
          "description": "User ID of the person who updated the dates"
        },
        "name": {
          "type": "string",
          "description": "Display name of the person who updated the dates"
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Server timestamp when the event was emitted"
    }
  }
}
```

---

## Example Payloads

### Example 1: Date Range Extension
```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-07T00:00:00.000Z",
  "updatedBy": {
    "id": "user-456",
    "name": "Alice Johnson"
  },
  "timestamp": "2026-02-04T15:30:00.000Z"
}
```
**Context**: Trip dates changed from June 1-5 to June 1-7 (2 days added)

### Example 2: Date Range Reduction
```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-03T00:00:00.000Z",
  "updatedBy": {
    "id": "user-789",
    "name": "Bob Smith"
  },
  "timestamp": "2026-02-04T16:45:00.000Z"
}
```
**Context**: Trip dates changed from June 1-5 to June 1-3 (2 days removed)

### Example 3: Null Dates (Unscheduled Trip)
```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startDate": null,
  "endDate": null,
  "updatedBy": {
    "id": "user-123",
    "name": "Charlie Brown"
  },
  "timestamp": "2026-02-04T17:00:00.000Z"
}
```
**Context**: User removed trip dates (trip now has no scheduled dates)

---

## Client Implementation Guide

### Listening for the Event

**React with Socket.io Context**:
```typescript
import { useSocket } from '@/context/SocketContext';
import type { TripDatesUpdatedData } from '@/sockets/types';

function MyComponent() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleDateUpdate = (data: TripDatesUpdatedData) => {
      console.log('Trip dates updated:', data);
      // Handle the update (show notification, refetch data, etc.)
    };

    socket.on('trip:datesUpdated', handleDateUpdate);

    return () => {
      socket.off('trip:datesUpdated', handleDateUpdate);
    };
  }, [socket]);
}
```

### Recommended Client Actions

When receiving this event, clients should:

1. **Display Notification**: Show a toast/banner informing the user
   ```typescript
   notifySuccess(`${data.updatedBy.name} updated trip dates`);
   ```

2. **Refetch Trip Data**: Query API for latest trip days and activities
   ```typescript
   queryClient.invalidateQueries(['trip', data.tripId]);
   queryClient.invalidateQueries(['tripDays', data.tripId]);
   ```

3. **Update Local State**: If using local state, update start/end dates
   ```typescript
   setTrip(prev => ({
     ...prev,
     startDate: data.startDate,
     endDate: data.endDate
   }));
   ```

4. **Filter Self-Initiated Events** (optional): Prevent notifying user of their own changes
   ```typescript
   if (data.updatedBy.id !== currentUser.id) {
     notifySuccess(`${data.updatedBy.name} updated trip dates`);
   }
   ```

---

## Server Implementation Guide

### Emitting the Event

**From Controller** (after successful update):
```typescript
import type { TripDatesUpdatedData } from '../sockets/types';

const updateTrip = async (req: Request, res: Response) => {
  // ... validation and update logic
  
  const updatedTrip = await tripService.update(id, data);
  
  // Emit event if dates changed
  if (data.startDate !== undefined || data.endDate !== undefined) {
    try {
      const io = req.app.get('io');
      const eventData: TripDatesUpdatedData = {
        tripId: id,
        startDate: updatedTrip.startDate?.toISOString() ?? null,
        endDate: updatedTrip.endDate?.toISOString() ?? null,
        updatedBy: {
          id: req.user.id,
          name: req.user.name
        },
        timestamp: new Date()
      };
      
      io.to(`trip:${id}`).emit('trip:datesUpdated', eventData);
      console.log(`Emitted trip:datesUpdated for trip ${id}`);
    } catch (error) {
      console.error('Failed to emit trip:datesUpdated:', error);
      // Don't fail HTTP request if socket emission fails
    }
  }
  
  res.status(200).json(updatedTrip);
};
```

---

## Error Handling

### Server-Side Errors

**Socket Instance Unavailable**:
```typescript
try {
  const io = req.app.get('io');
  if (!io) throw new Error('Socket.io instance not available');
  // ... emit event
} catch (error) {
  console.error('Failed to emit trip:datesUpdated:', error);
  // Continue with HTTP response
}
```

**Room Broadcast Failure**: Logged but does not affect HTTP response success.

### Client-Side Errors

**Malformed Payload**: TypeScript types prevent compile-time errors; runtime validation optional.

**Network Disconnection**: Socket.io handles auto-reconnection; clients refetch data on reconnect.

**Event Handler Crash**: Wrap handler in try-catch to prevent socket listener removal:
```typescript
const handleDateUpdate = (data: TripDatesUpdatedData) => {
  try {
    // Handle event
  } catch (error) {
    console.error('Error handling trip:datesUpdated:', error);
  }
};
```

---

## Testing

### Manual Testing

**Test Case 1: Basic Flow**
1. Open trip in Browser A (User A logged in)
2. Open same trip in Browser B (User B logged in)
3. In Browser A, change trip dates
4. Verify Browser B receives event within 1 second
5. Check payload matches expected structure

**Test Case 2: User Not in Room**
1. Open trip in Browser A
2. Do NOT join trip room in Browser B (stay on different page)
3. Change dates in Browser A
4. Verify Browser B does NOT receive event

**Test Case 3: Self-Notification**
1. Open trip in Browser A (User A)
2. Change dates in Browser A
3. Verify event received (or filtered based on implementation)

### Automated Testing (Optional)

**Socket.io Client Test**:
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('trip:datesUpdated', (data) => {
  console.log('Received event:', data);
  // Assert payload structure
  expect(data.tripId).toBeDefined();
  expect(data.updatedBy.name).toBeDefined();
});

// Trigger date update via API
await fetch('/api/trips/trip-123', {
  method: 'PATCH',
  body: JSON.stringify({ startDate: '2026-06-01', endDate: '2026-06-07' })
});
```

---

## Security Considerations

1. **Room Access Control**: Only users in `trip:{tripId}` room receive events. Join is protected by authentication middleware.

2. **Data Exposure**: Event payload contains non-sensitive data (dates, user name). No private information leaked.

3. **Authorization**: Trip update endpoint validates user is trip member before emitting event.

4. **Input Validation**: Dates validated by trip update schema; no direct user input in event payload.

---

## Performance Characteristics

- **Event Size**: ~200-300 bytes
- **Latency**: <100ms for room broadcast (same datacenter)
- **Scalability**: Linear with room size (typically <10 users per trip)
- **Network Impact**: Minimal; one-time broadcast per date update

---

## Backwards Compatibility

**Adding this event is backwards compatible**:
- Older clients ignore unknown events
- No breaking changes to existing events
- Server continues to function if socket emission fails
- HTTP endpoint behavior unchanged

---

## Related Events

- `trip:joined`: User joins trip room (prerequisite for receiving date updates)
- `trip:userJoined`: Notifies when another user joins trip
- `trip:userLeft`: Notifies when user leaves trip
- `activity:created`: Activity creation (may be affected by date range changes)
- `activity:deleted`: Activity deletion (triggered when dates shortened)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | Initial event definition |
