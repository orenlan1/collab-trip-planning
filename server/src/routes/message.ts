import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import messageController from '../controllers/message-controller.js';
const router = express.Router();

router.get("/:tripId", isAuthenticated, messageController.getMessages);



router.post("/:tripId", isAuthenticated, (req, res) => {

});

export default router;
