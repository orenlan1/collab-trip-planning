import { Router } from 'express';
import { InvitationController } from '../controllers/invitation-controller';
import { isAuthenticated } from '../middleware/auth';

const router = Router();
const invitationController = new InvitationController();

// Generate a magic link invitation
router.post('/magic-link', isAuthenticated, invitationController.createMagicLinkInvitation);

// Get invitation details by token
router.get('/magic-link/:token', invitationController.getInvitationByToken);

// Accept a magic link invitation
router.post('/magic-link/:token/accept', isAuthenticated, invitationController.acceptMagicLinkInvitation);

export default router;
