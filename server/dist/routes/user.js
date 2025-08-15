import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import userController from '../controllers/user-controller.js';
const router = express.Router();
router.get('/me', isAuthenticated, (req, res) => {
    res.json(req.user);
});
router.patch('/me', isAuthenticated, userController.updateUser);
export default router;
//# sourceMappingURL=user.js.map