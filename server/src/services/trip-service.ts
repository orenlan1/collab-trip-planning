import {prisma} from '../prisma/client.js';
import type {TripFormData, TripUpdateData } from '../controllers/trip-controller.js';


const create = async (data: TripFormData, creatorId: string) => {
  const trip = await prisma.trip.create({
    data: {
      title: data.title,
      ...(data.destination !== undefined && { destination: data.destination }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      createdById: creatorId,
      members: {
        create: {
            userId: creatorId,
            role: "creator"

        }
      }
    },
  });
  return trip;
};


const getAllTripsByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        memberships: {
            include: {
                trip: true
            }
        }
    }
  })
  return user?.memberships.map(m => m.trip) || [];
};

const getTripById = async (id: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    }
  });
  return trip;
};


const update = async (id: string, data: TripUpdateData) => {
  const trip = await prisma.trip.update({
    where: { id },
    data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.destination !== undefined && { destination: data.destination }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
    }
  });
  return trip;
};

const deleteTripById = async (id: string) => {
  const trip = await prisma.trip.delete({
    where: { id },
  });
  return trip;
};

const inviteUser = async (tripId: string, invitedUserEmail: string, inviterId: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      members: true,
      createdBy: true, // Assuming the creator is the inviter
    }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  const invitedUser = await prisma.user.findUnique({
    where: { email: invitedUserEmail },
  });

  if (!invitedUser) {
    throw new Error('Invited user not found');
  }

  const isAlreadyMember = trip.members.some(m => m.userId === invitedUser.id);
  if (isAlreadyMember) {
    throw new Error('User is already a member of this trip');
  }

  // Create an invitation
  return prisma.invitation.create({
    data: {
      tripId,
      invitedUserId: invitedUser.id,
      inviterUserId: inviterId, 
    },
  });
};




export default {
    create,
    getAllTripsByUserId,
    getTripById,
    update,
    deleteTripById,
    inviteUser
}