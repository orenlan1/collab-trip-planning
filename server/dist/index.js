import express from 'express';
import dotenv from 'dotenv';
import passport from './auth/passport.js';
import { sessionMiddleware } from './middleware/session.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tripRoutes from './routes/trip.js';
import cors from 'cors';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map