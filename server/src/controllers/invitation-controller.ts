import type { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitation-service';
import { NotFoundError } from '../errors/AppError.js';

const invitationService = new InvitationService();

export class InvitationController {
  async createMagicLinkInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { tripId } = req.body;
      const invitation = await invitationService.createMagicLinkInvitation(tripId, req.user!.id);
      const inviteUrl = `${process.env.CLIENT_URL}/trips/join/${invitation.token}`;
      res.json({ invitation, inviteUrl });
    } catch (error) {
      next(error);
    }
  }

  async acceptMagicLinkInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token!;
      const result = await invitationService.acceptMagicLinkInvitation(token, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getInvitationByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token!;
      const invitation = await invitationService.getInvitationByToken(token, req.user?.id);
      if (!invitation) {
        throw new NotFoundError('Invitation not found or expired');
      }
      res.json(invitation);
    } catch (error) {
      next(error);
    }
  }
}
