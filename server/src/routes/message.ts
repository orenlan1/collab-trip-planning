import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import messageController from '../controllers/message-controller.js';
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/messages
router.get("/", isAuthenticated, messageController.getMessages);
router.post("/", isAuthenticated, messageController.createMessage);

export default router;
