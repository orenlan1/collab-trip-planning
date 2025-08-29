import type { Request, Response } from 'express';
import { InvitationService } from '../services/invitation-service';

const invitationService = new InvitationService();

export class InvitationController {
  // Generate a magic link invitation
  async createMagicLinkInvitation(req: Request, res: Response) {
    try {
      const { tripId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const invitation = await invitationService.createMagicLinkInvitation(tripId, userId);
      
      // Generate the full invitation URL
      const inviteUrl = `${process.env.CLIENT_URL}/trips/join/${invitation.token}`;
      
      res.json({ 
        invitation,
        inviteUrl
      });
    } catch (error) {
      console.error('Error creating magic link invitation:', error);
      res.status(500).json({ error: 'Failed to create invitation' });
    }
  }

  // Accept a magic link invitation
  async acceptMagicLinkInvitation(req: Request, res: Response) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: 'Invalid invitation token' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await invitationService.acceptMagicLinkInvitation(token, userId);
      res.json(result);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  }

  // Get invitation details by token
  async getInvitationByToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: 'Invalid invitation token' });
      }

      const invitation = await invitationService.getInvitationByToken(token);

      if (!invitation) {
        return res.status(404).json({ error: 'Invitation not found or expired' });
      }

      res.json(invitation);
    } catch (error) {
      console.error('Error getting invitation:', error);
      res.status(500).json({ error: 'Failed to get invitation details' });
    }
  }
}
