# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Server (run from `server/`)
```bash
npm run dev      # Start dev server with nodemon (tsx, hot reload)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output
npx prisma migrate dev   # Apply DB migrations
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Open Prisma Studio GUI
```

### Client (run from `client/`)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Type-check and bundle for production
npm run lint     # Run ESLint
```

## Architecture

TripSync is a monorepo with a **React client** (`client/`) and an **Express server** (`server/`), communicating via REST API and Socket.IO.

### Backend — Clean Architecture

Request flow: **Route → Controller → Service → Prisma → PostgreSQL**

- No business logic in controllers — controllers only extract params and call services
- `server/src/services/` — all business logic lives here
- `server/src/schemas/` — Zod validation schemas, applied in middleware before controllers
- `server/src/middleware/` — includes `isAuthenticated` guard and validation middleware
- `server/src/sockets/` — Socket.IO service; applies session + Passport middleware so sockets have access to authenticated `req.user`
- `server/src/apiClients/` — thin wrappers for external APIs (Google Maps, Amadeus, Unsplash, UniRate, OpenAI)

### Frontend — Feature-Based Pages

- `client/src/pages/` — organized by feature (trips, itineraries, flights, lodging, budget, chat)
- `client/src/stores/` — Zustand stores (tripStore, itineraryStore, tripDayStore) with persistence middleware
- `client/src/context/` — React Context for Auth (user/login), Socket (connection), and Theme
- `client/src/layouts/` — `MainLayout` and `TripLayout` wrap pages
- UI: Tailwind CSS + Radix UI primitives + Ant Design components

### Authentication

Passport.js with two strategies (Local + Google OAuth). Sessions stored in PostgreSQL via `connect-pg-simple`. Protected API routes use the `isAuthenticated` middleware. The frontend reads auth state from `AuthContext`.

### Real-Time (Socket.IO)

The `SocketProvider` context initializes the client socket. On connection, users join a personal room (`user:<userId>`) and per-trip rooms (`trip:<tripId>`). Events cover trip updates, chat messages, itinerary changes, budget updates, and user presence.

### Code Style (from `.github/copilot-instructions.md`)

- SOLID, DRY, KISS, YAGNI
- TypeScript strict mode — no `any`, explicit return types required
- Minimal comments — only when logic is non-obvious

## Environment Variables

**Server** (`server/.env`):
```
DATABASE_URL, SESSION_SECRET, PORT, NODE_ENV
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
AMADEUS_API_KEY, AMADEUS_API_SECRET
GOOGLE_MAPS_API_KEY, UNSPLASH_ACCESS_KEY, UNSPLASH_SECRET_KEY
UNIRATE_API_KEY, OPENAI_API_KEY
CLIENT_URL, SERVER_URL
```

**Client** (`client/.env`):
```
VITE_GOOGLE_MAPS_API_KEY
```
