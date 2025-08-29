import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class InvitationService {
  // Create a magic link invitation
  async createMagicLinkInvitation(tripId: string, inviterUserId: string) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // Link expires in 72 hours

    const invitation = await prisma.invitation.create({
      data: {
        tripId,
        inviterUserId,
        token,
        type: 'MAGIC_LINK',
        expiresAt,
        status: 'ACTIVE'
      },
      include: {
        trip: true,
        inviterUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return invitation;
  }

  // Validate and accept a magic link invitation
  async acceptMagicLinkInvitation(token: string, userId: string) {
    // Start a transaction to handle the invitation check and member creation atomically
    const result = await prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: {
          token,
          type: 'MAGIC_LINK',
          status: 'ACTIVE',
          expiresAt: {
            gt: new Date() // Check if not expired
          }
        },
        include: {
          trip: true
        }
      });

      if (!invitation) {
        throw new Error('Invalid or expired invitation');
      }

      // Check if user is already a member
      const existingMember = await tx.tripMember.findFirst({
        where: {
          tripId: invitation.tripId,
          userId
        }
      });

      if (existingMember) {
        throw new Error('User is already a member of this trip');
      }

      // Create trip member
      const newMember = await tx.tripMember.create({
        data: {
          tripId: invitation.tripId,
          userId,
          role: 'member'
        }
      });

      return { invitation, member: newMember };
    });

    return result;
  }

  // Get invitation by token
  async getInvitationByToken(token: string) {
    return prisma.invitation.findFirst({
      where: {
        token,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        trip: true,
        inviterUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }
}
