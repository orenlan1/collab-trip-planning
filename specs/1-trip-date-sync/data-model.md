# Data Model: Trip Date Synchronization

**Feature**: 1-trip-date-sync  
**Last Updated**: 2026-02-04

---

## Overview

This feature requires **no database schema changes**. It uses existing Trip model and adds a new Socket.io event type.

---

## Existing Database Schema

### Trip Table
```prisma
model Trip {
  id          String    @id @default(uuid())
  title       String
  destination String
  description String?
  startDate   DateTime?
  endDate     DateTime?
  image       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  createdBy   String
  
  creator     User         @relation("CreatedTrips", fields: [createdBy], references: [id], onDelete: Cascade)
  members     TripMember[]
  tripDays    TripDay[]
  // ... other relations
}
```

**Relevant Fields**:
- `startDate`: Optional trip start date
- `endDate`: Optional trip end date
- `updatedAt`: Automatically updated on any change

**No modifications needed** - feature reads these fields for event payload.

---

## Socket Event Data Structure

### TripDatesUpdatedData

**Purpose**: Payload for `trip:datesUpdated` Socket.io event

**TypeScript Interface**:
```typescript
interface TripDatesUpdatedData {
  tripId: string;           // UUID of the trip
  startDate: string | null; // ISO 8601 string or null
  endDate: string | null;   // ISO 8601 string or null
  updatedBy: {
    id: string;             // User ID who made the change
    name: string;           // User display name
  };
  timestamp: Date;          // When the change occurred
}
```

**Field Descriptions**:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `tripId` | string | No | Identifies which trip was modified |
| `startDate` | string \| null | Yes | New start date in ISO 8601 format (YYYY-MM-DD) |
| `endDate` | string \| null | Yes | New end date in ISO 8601 format (YYYY-MM-DD) |
| `updatedBy.id` | string | No | User ID from session (req.user.id) |
| `updatedBy.name` | string | No | User's display name for notification |
| `timestamp` | Date | No | Server timestamp when event was emitted |

**Example Payload**:
```json
{
  "tripId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-06-07T00:00:00.000Z",
  "updatedBy": {
    "id": "user-123",
    "name": "Alice Johnson"
  },
  "timestamp": "2026-02-04T15:30:00.000Z"
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User updates trip dates via UI                          │
│    PATCH /api/trips/:id                                     │
│    Body: { startDate: "2026-06-01", endDate: "2026-06-07" }│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. trip-controller.updateTrip                               │
│    - Validates request                                      │
│    - Calls tripService.update(id, data)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. tripService.update                                       │
│    - Updates Trip record in database                        │
│    - Updates TripDay records (adds/removes days)            │
│    - Deletes activities on removed days (existing behavior) │
│    - Returns updated Trip                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. trip-controller emits socket event                       │
│    - Constructs TripDatesUpdatedData payload                │
│    - Emits to room: trip:{tripId}                           │
│    - Returns HTTP 200 with updated trip                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Connected clients receive event                          │
│    - TripItinerarySocketContext handles event               │
│    - Displays notification                                  │
│    - Refetches trip data                                    │
│    - UI updates with new date range                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

### Server-Side
- `tripId` must be valid UUID (validated by route parameter)
- `startDate` and `endDate` validation handled by existing trip update schema
- User must be authenticated (checked in controller)
- User must be trip member (checked in service layer)

### Client-Side
- Event payload must match `TripDatesUpdatedData` interface (TypeScript validation)
- Dates parsed as ISO 8601 strings
- No additional validation needed (trust server data)

---

## State Management Considerations

### Client State Updates

**Before Event**:
```typescript
// Itinerary page state
{
  trip: { id: "trip-123", startDate: "2026-06-01", endDate: "2026-06-05" },
  tripDays: [
    { date: "2026-06-01", dayNumber: 1, activities: [...] },
    { date: "2026-06-02", dayNumber: 2, activities: [...] },
    // ... 5 days total
  ]
}
```

**After Event** (dates extended to June 7):
```typescript
// After refetch
{
  trip: { id: "trip-123", startDate: "2026-06-01", endDate: "2026-06-07" },
  tripDays: [
    { date: "2026-06-01", dayNumber: 1, activities: [...] },
    { date: "2026-06-02", dayNumber: 2, activities: [...] },
    // ... 7 days total (June 6-7 added)
  ]
}
```

**Refetch Strategy**: Client fetches entire trip data on event reception (simpler than calculating diff).

---

## Performance Considerations

### Event Payload Size
- **Typical size**: ~200-300 bytes
- **Network impact**: Negligible for real-time updates
- **No optimization needed**: Payload contains only essential data

### Database Impact
- **No additional queries**: Event uses data from update response
- **Existing trip update**: Already handles TripDay creation/deletion
- **No performance regression**

### Socket.io Room Broadcast
- **Scaling**: Tested pattern (used for chat, activities)
- **Room size**: Limited by trip members (typically <10 users)
- **Latency**: <100ms for broadcast in same datacenter

---

## Migration Requirements

**None** - This feature:
- Uses existing database schema
- Adds new event type (backwards compatible)
- No data migration needed
- No schema changes required

---

## Related Entities

### TripDay
**Impact**: Created/deleted automatically when trip dates change (existing behavior)

```prisma
model TripDay {
  id         String   @id @default(uuid())
  tripId     String
  date       DateTime
  dayNumber  Int
  activities Activity[]
  trip       Trip     @relation(fields: [tripId], references: [id], onDelete: Cascade)
}
```

**Change**: No schema modification; service layer handles CRUD

### Activity  
**Impact**: Deleted if associated TripDay is removed (cascade delete, existing behavior)

```prisma
model Activity {
  id         String    @id @default(uuid())
  tripDayId  String
  // ... other fields
  tripDay    TripDay   @relation(fields: [tripDayId], references: [id], onDelete: Cascade)
}
```

**Change**: No modification needed; existing cascade handles cleanup

---

## Summary

- ✅ No database migrations required
- ✅ No schema changes
- ✅ New TypeScript interface for socket event
- ✅ Leverages existing Trip and TripDay models
- ✅ Backwards compatible with existing code
