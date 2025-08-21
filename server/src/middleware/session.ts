import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dotenv from 'dotenv';

dotenv.config();

// Create PostgreSQL session store
const PostgresqlStore = pgSession(session);

// Create store instance
const store = new PostgresqlStore({
  // Using the same connection string as Prisma
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true, // Automatically creates the session table
  tableName: 'Session',       // Table name for sessions
  pruneSessionInterval: 60 * 15, // Clean up expired sessions every 15 minutes
});

export const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET || 'supersecretfallback',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax'
  },
});
