# 🧳 TripSync 

TripSync is a collaborative trip planning platform powered by real-time communication and AI. It helps groups of travelers co-plan a trip smoothly with smart itinerary suggestions, live video/chat, group voting, and more — all in one place.

## ✨ Features

- 🔐 User registration and group trip creation
- 🤖 AI-assisted itinerary generation based on:
  - Budget
  - Interests (culture, nightlife, nature, etc.)
  - Preferred travel dates
- 📆 Drag-and-drop shared itinerary board
- 🗳️ Voting system for lodging, destinations, dates
- 💬 Real-time chat and WebRTC video calls
- 🌍 Integration with Booking, Skyscanner, Google Places
- 🧾 (Optional) Expense tracking / photo gallery / trip journal

## 🛠️ Tech Stack

| Layer       | Stack                                    |
|------------|-------------------------------------------|
| Frontend   | React, TailwindCSS, Zustand               |
| Backend    | Node.js, Express, Prisma, PostgreSQL      |
| Auth       | Auth0 / Firebase Auth                     |
| AI         | OpenAI GPT API                            |
| APIs       | Booking.com, Skyscanner, Google Places    |
| Real-Time  | WebRTC, Socket.IO                         |
| Deployment | Railway / Vercel / Render + Docker        |

## 🗂️ Folder Structure

trip-sync/
│
├── client/                      # Frontend (React + Vite + Tailwind)
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── assets/              # Images, icons
│   │   ├── components/          # Shared UI components (e.g., Button, Card)
│   │   ├── pages/               # Route pages (e.g., /dashboard, /trip/:id)
│   │   ├── features/            # Logic per feature (chat, voting, itinerary)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── stores/              # Zustand or Redux state
│   │   ├── services/            # API calls (e.g., axios clients)
│   │   ├── types/               # Shared TS types/interfaces
│   │   ├── App.tsx             # Main component
│   │   └── main.tsx            # Entry point
│   └── vite.config.ts          # Vite config
│
├── server/                      # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/         # Route logic
│   │   ├── routes/              # Express route definitions
│   │   ├── middleware/          # Auth, error handling, validation
│   │   ├── services/            # External services (AI, Booking APIs, etc.)
│   │   ├── sockets/             # Socket.IO & WebRTC signaling logic
│   │   ├── utils/               # Utility functions
│   │   ├── types/               # Shared server-side types
│   │   └── index.ts             # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Optional seed script
│   └── .env                     # Environment variables (DB, APIs, etc.)
│
├── shared/                      # Shared code between client and server
│   └── types/                   # Trip, User, Message, Itinerary, Vote types
│
├── docs/                        # Planning, wireframes, API contracts
│   ├── mockups/                 # Screenshots or Figma exports
│   └── api.md                   # REST + socket API spec
│
├── .gitignore
├── package.json                 # Workspace-wide scripts
├── tsconfig.json                # Shared TypeScript config
└── README.md







## 🚀 Getting Started

1. Clone this repository
2. Set up `.env` for API keys (OpenAI, Booking, etc.)
3. `cd server && npm install && npx prisma migrate dev`
4. `cd client && npm install && npm run dev`

## 🧪 Scripts

```bash
# Server
npm run dev       # Start backend
npm run test      # Run backend tests

# Client
npm run dev       # Start frontend
npm run build     # Build production bundle
