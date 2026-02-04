# Quick Start Guide: Trip Date Synchronization Implementation

**Feature**: Real-Time Trip Date Change Synchronization  
**Branch**: `1-trip-date-sync`  
**Estimated Time**: 2-3 hours

---

## Overview

Add Socket.io event emission when trip dates are updated so all connected users see changes in real-time without page refresh.

---

## What You're Building

**User Story**: When Alice changes trip dates from June 1-5 to June 1-7, Bob (viewing the same trip) immediately sees a notification and his itinerary updates to show the new date range.

**Technical Approach**: 
1. Backend emits `trip:datesUpdated` event after successful PATCH to `/api/trips/:id`
2. Frontend listens for event, displays notification, refetches trip data

---

## Step-by-Step Implementation

### Step 1: Add Backend Types (5 min)

**File**: `server/src/sockets/types.ts`

Add to `ServerToClientEvents` interface:
```typescript
"trip:datesUpdated": (data: TripDatesUpdatedData) => void;
```

Add new interface before exports:
```typescript
export interface TripDatesUpdatedData {
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

### Step 2: Emit Event from Controller (15 min)

**File**: `server/src/controllers/trip-controller.ts`

Modify `updateTrip` function - add after successful `tripService.update()` call:

```typescript
// Emit socket event if dates were changed
if (data.startDate !== undefined || data.endDate !== undefined) {
    try {
        const io = req.app.get('io');
        io.to(`trip:${id}`).emit('trip:datesUpdated', {
            tripId: id,
            startDate: updatedTrip.startDate?.toISOString() ?? null,
            endDate: updatedTrip.endDate?.toISOString() ?? null,
            updatedBy: {
                id: req.user.id,
                name: req.user.name
            },
            timestamp: new Date()
        });
        console.log(`Emitted trip:datesUpdated for trip ${id}`);
    } catch (socketError) {
        console.error('Failed to emit trip:datesUpdated:', socketError);
    }
}
```

### Step 3: Add Frontend Types (5 min)

**File**: `client/src/sockets/types.ts`

Add to `ServerToClientEvents` interface:
```typescript
"trip:datesUpdated": (data: TripDatesUpdatedData) => void;
```

Add new interface at end of file:
```typescript
export interface TripDatesUpdatedData {
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

### Step 4: Listen for Event in Client (20 min)

**File**: `client/src/context/TripItinerarySocketContext.tsx`

Add new useEffect (after existing activity event listeners):

```typescript
// Listen for trip date changes
useEffect(() => {
  if (!socket || !isReady || !tripId) return;

  const handleTripDatesUpdated = (data: TripDatesUpdatedData) => {
    // Don't notify current user
    if (data.updatedBy.id !== user?.id) {
      const formatDate = (dateStr: string | null) => 
        dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
      
      notifySuccess(
        `${data.updatedBy.name} updated trip dates to ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`
      );
    }
    
    // TODO: Trigger refetch of trip data
    // This depends on your state management approach
    // Options:
    // - Call refetch function passed via props/context
    // - Dispatch event that itinerary page listens to
    // - Use React Query queryClient.invalidateQueries()
  };

  socket.on('trip:datesUpdated', handleTripDatesUpdated);

  return () => {
    socket.off('trip:datesUpdated', handleTripDatesUpdated);
  };
}, [socket, isReady, tripId, user]);
```

Import the type at top of file:
```typescript
import type { TripDatesUpdatedData } from "@/sockets/types";
```

### Step 5: Wire Up Data Refetch (15-30 min)

**Implementation depends on your itinerary page state management:**

**Option A - React Query**:
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
// In event handler:
queryClient.invalidateQueries(['trip', tripId]);
queryClient.invalidateQueries(['tripDays', tripId]);
```

**Option B - Custom Refetch Function**:
Pass refetch function via context or props to TripItinerarySocketContext, call it in event handler.

**Option C - Event Bus**:
Emit custom event that itinerary page listens for:
```typescript
window.dispatchEvent(new CustomEvent('tripDatesChanged', { detail: data }));
```

---

## Testing Checklist

### Manual Testing (30 min)

1. **Basic Flow**:
   - [ ] Open trip in two browser windows (different accounts)
   - [ ] Change dates in Window A
   - [ ] Verify notification appears in Window B within 1 second
   - [ ] Verify itinerary in Window B updates automatically

2. **Edge Cases**:
   - [ ] Change only trip title (not dates) → No event emitted
   - [ ] Change dates with activities on deleted days → Activities deleted, notification shown
   - [ ] Open same trip in two tabs (same account) → Notification behavior acceptable
   - [ ] Change dates with no other users online → No errors logged

3. **Error Handling**:
   - [ ] Stop server mid-test → Frontend shows disconnected state
   - [ ] Restart server → Frontend reconnects, data current

### Browser Console Checks
- [ ] No TypeScript errors
- [ ] Backend logs "Emitted trip:datesUpdated for trip {id}"
- [ ] No socket emission errors

---

## Troubleshooting

**Event not received on client**:
- Check browser console for socket connection status
- Verify user joined trip room (check for "trip:joined" event)
- Check backend logs for emission confirmation

**TypeScript errors**:
- Ensure types match between client and server
- Run `npm run build` to verify compilation

**Notification not showing**:
- Check `notifySuccess` function is imported
- Verify notification CSS is loaded
- Check browser console for React errors

---

## Files Modified

- ✏️ `server/src/sockets/types.ts` - Add event type
- ✏️ `server/src/controllers/trip-controller.ts` - Emit event
- ✏️ `client/src/sockets/types.ts` - Add event type  
- ✏️ `client/src/context/TripItinerarySocketContext.tsx` - Listen for event

**Total Lines Changed**: ~50-60 lines

---

## Commit Message

```
feat: add real-time trip date change synchronization

- Emit trip:datesUpdated socket event when dates modified
- Display notification to connected users
- Auto-refresh itinerary on date change
- Prevent conflicts from concurrent date/activity edits

Implements spec 1-trip-date-sync
```

---

## Next Actions After Implementation

1. **Manual QA**: Test with 2-3 users concurrently
2. **Code Review**: Self-review changes against constitution principles
3. **Documentation**: Update README if socket events are documented
4. **Merge**: Create PR from `1-trip-date-sync` to `main`
