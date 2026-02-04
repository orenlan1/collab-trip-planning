# Implementation Plan: Real-Time Trip Date Change Synchronization

**Feature ID:** 1-trip-date-sync  
**Branch:** 1-trip-date-sync  
**Status:** Planning  
**Created:** 2026-02-04

---

## Technical Context

### Current Architecture
- **Socket.io Integration**: Fully operational with typed events in `server/src/sockets/types.ts` and `client/src/sockets/types.ts`
- **Socket Service**: Centralized socket management in `server/src/sockets/socket-service.ts` with connection tracking
- **Trip Handler**: Existing trip room management in `server/src/sockets/handlers/trip-handler.ts` handling `trip:join` and `trip:leave` events
- **Trip Controller**: Trip CRUD operations in `server/src/controllers/trip-controller.ts` with `updateTrip` endpoint
- **Client Socket Contexts**: 
  - `TripSocketContext`: General trip socket management
  - `TripItinerarySocketContext`: Itinerary-specific event listeners
- **Room Naming**: Convention `trip:{tripId}` for trip-specific broadcasts

### Trip Date Update Flow (Current)
1. User modifies trip dates via UI form
2. PATCH request to `/api/trips/:id` endpoint
3. `trip-controller.updateTrip` receives request
4. `trip-service.update` performs database update including date changes
5. Response returned to requesting client
6. **Missing**: No Socket.io broadcast to other connected users

### Existing Socket Event Patterns
- **Activity events**: `activity:created`, `activity:updated`, `activity:deleted` - emit from service layer
- **Chat events**: `chat:newMessage` - emit from socket handler
- **Trip events**: `trip:userJoined`, `trip:userLeft` - connection lifecycle events

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, Socket.io, Prisma
- **Frontend**: React, TypeScript, Socket.io-client, React Router
- **Database**: PostgreSQL (via Prisma)

### Known Dependencies
- Socket.io server instance accessible in controllers via `req.app.get('io')` (pattern used in `inviteUserToTrip`)
- Users must be in `trip:{tripId}` room to receive events (managed by TripHandler)
- Client components use `useSocket()` hook from SocketContext

---

## Constitution Compliance Check

### Principle 1: Simplicity Over Completeness ✅
- **Compliance**: Feature adds single event emission to existing update flow
- **Justification**: Minimal code changes, leverages existing Socket.io infrastructure

### Principle 2: Real-Time First Architecture ✅
- **Compliance**: Core feature - synchronizes date changes across users in real-time
- **Justification**: Direct application of real-time architecture; prevents data conflicts

### Principle 3: TypeScript Strictness Without Compromise ✅
- **Compliance**: Will add typed event interfaces to existing type definitions
- **Justification**: Extends typed Socket.io pattern already in use

### Principle 4: Clean Architecture Boundaries ✅
- **Compliance**: Controller handles HTTP, service layer manages business logic, socket emission in controller (consistent with invite pattern)
- **Justification**: Follows existing pattern in `inviteUserToTrip` controller method

### Principle 6: Production-Ready Code Quality ✅
- **Compliance**: Includes error handling, validation reuses existing schemas, proper logging
- **Justification**: Maintains current code quality standards

### Principle 7: Avoid Heavy Integrations ✅
- **Compliance**: Uses existing Socket.io integration, no new dependencies
- **Justification**: Zero new external dependencies

**Gate Status:** ✅ PASS - All applicable principles satisfied

---

## Phase 0: Research & Technical Discovery

### Research Tasks

#### R1: Trip Date Change Impact Analysis
**Question**: What entities/data are affected when trip dates change?

**Findings**:
- **TripDay records**: Generated for each date in range; must be created/deleted when range changes
- **Activities**: Associated with TripDay via `tripDayId`; existing behavior deletes activities when days are removed
- **Client State**: Itinerary pages store trip days in local state; must re-fetch after date change
- **Cached Data**: No client-side caching layer; data fetched on page load

**Decision**: Socket event triggers client to re-fetch trip data (trip days + activities) rather than sending full data in event payload

**Rationale**: 
- Simpler implementation (no need to calculate diff of trip days)
- Consistent with existing activity event pattern (client refetches activity list)
- Avoids large payloads in socket events
- Ensures data consistency (single source of truth from API)

#### R2: Socket Event Emission Point
**Question**: Where should the socket event be emitted - controller or service layer?

**Findings**:
- **Activity events**: Emitted from service layer (e.g., `activity-service.ts`)
- **Invitation events**: Emitted from controller (e.g., `trip-controller.inviteUserToTrip`)
- **Socket instance access**: Available via `req.app.get('io')` in controllers

**Decision**: Emit from controller after successful service update

**Rationale**:
- Consistent with invitation pattern already in codebase
- Controller already has access to socket instance
- Event emission is HTTP-layer concern (response to successful HTTP request)
- Simpler than passing socket instance to service layer

**Alternatives Considered**:
- Service layer emission: Would require injecting socket instance into services; adds complexity
- Middleware emission: Overcomplicated for single use case

#### R3: Client Notification Strategy
**Question**: How should clients be notified visually when dates change?

**Findings**:
- Existing notification system: `notifySuccess()` function in TripLayout
- Used by TripItinerarySocketContext for activity notifications
- Toast-style notifications with auto-dismiss

**Decision**: Display toast notification + automatic data refetch

**Rationale**:
- Consistent with existing notification patterns
- Non-intrusive to user workflow
- Clear indication of who made the change

#### R4: Reconnection Handling
**Question**: Do we need special logic for users who reconnect after missing date change events?

**Findings**:
- Clients fetch trip data on page mount
- No persistent local state across sessions
- Socket.io auto-reconnects on connection loss

**Decision**: No special reconnection logic needed

**Rationale**:
- Clients always fetch fresh data on mount
- No stale state risk
- Follows YAGNI principle (don't add complexity until needed)

---

## Phase 1: Design Artifacts

### Data Model

No database schema changes required. Feature uses existing Trip model:

```prisma
model Trip {
  id          String   @id @default(uuid())
  title       String
  destination String
  description String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  // ... relations
}
```

### Socket Event Contract

#### Event: `trip:datesUpdated`

**Direction**: Server → Client  
**Room**: `trip:{tripId}`  
**Trigger**: Successful trip date update via PATCH `/api/trips/:id`

**Payload Type**:
```typescript
interface TripDatesUpdatedData {
  tripId: string;
  startDate: string | null;  // ISO 8601 format
  endDate: string | null;    // ISO 8601 format
  updatedBy: {
    id: string;
    name: string;
  };
  timestamp: Date;
}
```

**Client Response**:
- Display notification: "{updatedBy.name} changed trip dates"
- Re-fetch trip days and activities for current trip
- Update UI to reflect new date range

**Error Handling**:
- If emission fails, log error but don't fail HTTP request (event is supplementary)
- Clients handle missing events by fetching on next page load

---

### API Contracts

No new endpoints required. Modification to existing endpoint:

#### PATCH `/api/trips/:id`

**Request Body** (no changes):
```typescript
{
  title?: string;
  destination?: string;
  description?: string;
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
}
```

**Response** (no changes):
```typescript
{
  id: string;
  title: string;
  destination: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  // ... other fields
}
```

**Side Effect** (NEW):
- If `startDate` or `endDate` changed, emits `trip:datesUpdated` to room `trip:{id}`

---

### Component Integration Points

#### Server
1. **`server/src/sockets/types.ts`**: Add `trip:datesUpdated` to `ServerToClientEvents`
2. **`server/src/controllers/trip-controller.ts`**: Emit event in `updateTrip` after successful update
3. No changes to services or handlers

#### Client
1. **`client/src/sockets/types.ts`**: Add `trip:datesUpdated` to `ServerToClientEvents` and data interface
2. **`client/src/context/TripItinerarySocketContext.tsx`**: Add event listener and notification handler
3. **Affected pages**: Itinerary page will automatically re-render when context triggers refetch

---

## Phase 2: Implementation Checklist

### Backend Tasks

- [ ] **BE-1**: Update `server/src/sockets/types.ts`
  - Add `TripDatesUpdatedData` interface
  - Add `"trip:datesUpdated": (data: TripDatesUpdatedData) => void` to `ServerToClientEvents`

- [ ] **BE-2**: Modify `server/src/controllers/trip-controller.ts`
  - In `updateTrip` function, after successful `tripService.update()`:
    - Check if `startDate` or `endDate` was in request body
    - Get socket.io instance via `req.app.get('io')`
    - Emit `trip:datesUpdated` to room `trip:{id}` with payload
    - Include try-catch for socket emission (don't fail HTTP request)
    - Log emission for debugging

- [ ] **BE-3**: Testing
  - Manual test: Update trip dates with two browser windows open
  - Verify event received in second window
  - Test with no startDate/endDate in update (should not emit)
  - Test error handling (socket instance unavailable)

### Frontend Tasks

- [ ] **FE-1**: Update `client/src/sockets/types.ts`
  - Add `TripDatesUpdatedData` interface (matching server)
  - Add `"trip:datesUpdated": (data: TripDatesUpdatedData) => void` to `ServerToClientEvents`

- [ ] **FE-2**: Modify `client/src/context/TripItinerarySocketContext.tsx`
  - Add `useEffect` for `trip:datesUpdated` event listener
  - On event: Display notification with updater's name
  - Trigger refetch of trip data (trip days + activities)
  - Filter out events from current user (optional: prevent self-notification)

- [ ] **FE-3**: Verify itinerary page integration
  - Ensure page subscribes to TripItinerarySocketContext
  - Confirm data refetch updates displayed dates
  - Test UI responsiveness to rapid date changes

- [ ] **FE-4**: Testing
  - Two-window test: Change dates in Window A, verify notification in Window B
  - Test date range expansion (days added)
  - Test date range reduction (days removed, activities deleted)
  - Test rapid successive changes (debouncing not required but nice-to-have)
  - Test with disconnected client (verify state on reconnect)

### Documentation

- [ ] **DOC-1**: Update socket event documentation (if exists)
- [ ] **DOC-2**: Add code comments explaining emission logic in controller

---

## Implementation Notes

### Code Examples

#### Backend: trip-controller.ts
```typescript
const updateTrip = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    const data: UpdateTripInput = req.body;
    
    try {
        const updatedTrip = await tripService.update(id, data);
        
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
                // Don't fail the HTTP request if socket emission fails
            }
        }
        
        res.status(200).json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: "Failed to update trip" });
    }
};
```

#### Frontend: TripItinerarySocketContext.tsx
```typescript
useEffect(() => {
  if (!socket || !isReady || !tripId) return;

  const handleTripDatesUpdated = (data: TripDatesUpdatedData) => {
    // Don't notify current user (they triggered the change)
    if (data.updatedBy.id !== user?.id) {
      const startDate = data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A';
      const endDate = data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A';
      notifySuccess(
        `${data.updatedBy.name} updated trip dates to ${startDate} - ${endDate}`
      );
    }
    
    // Trigger refetch of trip data
    // (Implementation depends on how itinerary page manages state)
    // Option 1: Emit custom event for page to listen to
    // Option 2: Use React Query invalidation
    // Option 3: Call refetch function passed via context
  };

  socket.on('trip:datesUpdated', handleTripDatesUpdated);

  return () => {
    socket.off('trip:datesUpdated', handleTripDatesUpdated);
  };
}, [socket, isReady, tripId, user]);
```

### Edge Case Handling

1. **User updates only title (no date change)**: Event not emitted (check for date fields in request)
2. **Multiple tabs open for same user**: User may see their own notification - acceptable or filter by user ID
3. **Socket emission fails**: HTTP request succeeds, log error, user gets stale data until manual refresh
4. **User not in trip room**: Won't receive event; data fetched on next page load
5. **Date set to null**: Event includes `null` values; client handles appropriately

---

## Rollout Plan

### Phase 1: Backend Implementation
1. Add type definitions
2. Implement controller emission logic
3. Test with Postman + socket.io client

### Phase 2: Frontend Implementation  
4. Add type definitions
5. Implement event listener in context
6. Wire up refetch logic
7. Test with two browsers

### Phase 3: Validation
8. Manual QA with multiple users
9. Edge case testing
10. Monitor logs for socket errors

### Phase 4: Deployment
11. Deploy backend first (backwards compatible)
12. Deploy frontend
13. Monitor for issues

---

## Success Validation

### Acceptance Criteria
- [ ] When User A updates trip dates, User B (viewing same trip) sees notification within 1 second
- [ ] Notification displays User A's name and new date range
- [ ] User B's itinerary page updates automatically without manual refresh
- [ ] User A does not see duplicate notification for their own change
- [ ] Activities on deleted dates are handled (existing behavior preserved)
- [ ] No errors logged for socket emission failures
- [ ] Feature works across multiple browser tabs for same user

### Test Scenarios
1. **Basic flow**: User A extends trip dates, User B sees update
2. **Date reduction**: User A shortens trip, activities deleted, User B notified
3. **Non-date update**: User A changes title only, no socket event emitted
4. **Disconnected user**: User B reconnects, sees current data on page load
5. **Solo user**: User A updates dates with no other users online, no errors

---

## Open Questions

None - all clarifications resolved in Phase 0 research.

---

## Next Steps

1. Review this implementation plan
2. Proceed with **BE-1**: Update server socket types
3. Follow checklist sequentially through backend then frontend tasks
4. Manual testing with two browser windows after each phase
5. Commit to branch `1-trip-date-sync`
