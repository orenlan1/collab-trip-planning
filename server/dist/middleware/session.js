import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();
export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'supersecretfallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
});
//# sourceMappingURL=session.js.map