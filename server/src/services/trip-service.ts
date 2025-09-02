import {prisma} from '../prisma/client.js';
import type {TripFormData, TripUpdateData } from '../controllers/trip-controller.js';
import itineraryService from './itinerary-service.js';


const create = async (data: TripFormData, creatorId: string) => {
  // Normalize dates to ensure consistent handling
  let normalizedStartDate = undefined;
  let normalizedEndDate = undefined;
  
  if (data.startDate) {
    const startDateStr = typeof data.startDate === 'string' 
      ? data.startDate 
      : data.startDate instanceof Date 
        ? data.startDate.toISOString().split('T')[0] 
        : String(data.startDate).split('T')[0];
    normalizedStartDate = new Date(`${startDateStr}T00:00:00.000Z`);
  }
  
  if (data.endDate) {
    const endDateStr = typeof data.endDate === 'string' 
      ? data.endDate 
      : data.endDate instanceof Date 
        ? data.endDate.toISOString().split('T')[0] 
        : String(data.endDate).split('T')[0];
    normalizedEndDate = new Date(`${endDateStr}T00:00:00.000Z`);
  }


  const trip = await prisma.trip.create({
    data: {
      title: data.title,
      ...(data.destination !== undefined && { destination: data.destination }),
      ...(data.description !== undefined && { description: data.description }),
      ...(normalizedStartDate !== undefined && { startDate: normalizedStartDate }),
      ...(normalizedEndDate !== undefined && { endDate: normalizedEndDate }),
      createdById: creatorId,
      members: {
        create: {
            userId: creatorId,
            role: "creator"
        }
      },
      itinerary: {
        create: {} // Initialize empty itinerary
      }
    },
    include: {
      itinerary: true
    },
  });


  if (data.startDate && data.endDate && trip.itinerary) {
    // Use the normalized dates we already created
    const days = await itineraryService.createItineraryDays(
      trip.itinerary.id, 
      normalizedStartDate!, 
      normalizedEndDate!
    );
  }
  
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
        select: {
          userId: true,
          role: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true, // Include image if available
            }
          }
        }
      },
      itinerary: {
        select: {
          id: true
        }
      }
    }
  });
  
  return trip;
};


const update = async (id: string, data: TripUpdateData) => {
  // Normalize dates for update
  let normalizedStartDate = undefined;
  let normalizedEndDate = undefined;
  
  if (data.startDate) {
    const startDateStr = typeof data.startDate === 'string' 
      ? data.startDate 
      : data.startDate instanceof Date 
        ? data.startDate.toISOString().split('T')[0] 
        : String(data.startDate).split('T')[0];
    normalizedStartDate = new Date(`${startDateStr}T00:00:00.000Z`);
  }
  
  if (data.endDate) {
    const endDateStr = typeof data.endDate === 'string' 
      ? data.endDate 
      : data.endDate instanceof Date 
        ? data.endDate.toISOString().split('T')[0] 
        : String(data.endDate).split('T')[0];
    normalizedEndDate = new Date(`${endDateStr}T00:00:00.000Z`);
  }

  const trip = await prisma.trip.update({
    where: { id },
    data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.destination !== undefined && { destination: data.destination }),
        ...(normalizedStartDate !== undefined && { startDate: normalizedStartDate }),
        ...(normalizedEndDate !== undefined && { endDate: normalizedEndDate }),
        ...(data.description !== undefined && { description: data.description }),
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


const getNewestTripsMetadataByUserId = async (userId : string, limit: number) => {
  const trips = await prisma.trip.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      image: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
  return trips;
};

export default {
    create,
    getAllTripsByUserId,
    getTripById,
    update,
    deleteTripById,
    inviteUser,
    getNewestTripsMetadataByUserId
}