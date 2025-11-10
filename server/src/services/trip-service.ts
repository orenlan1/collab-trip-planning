import {prisma} from '../prisma/client.js';
import type {TripFormData, TripUpdateData } from '../controllers/trip-controller.js';
import itineraryService from './itinerary-service.js';
import { getExcludedDates, normalizeDate, formatTripForAPI } from '../lib/utils.js';
import type { CreateTripInput, UpdateTripInput } from '../schemas/trip-schema.js';



const create = async (data: CreateTripInput, creatorId: string) => {

  const trip = await prisma.trip.create({
    data: {
      ...data,
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

  // Create itinerary days if dates are provided
  if (data.startDate && data.endDate && trip.itinerary) {
    await itineraryService.createItineraryDays(
      trip.itinerary.id, 
      data.startDate, 
      data.endDate
    );
  }
  
  return formatTripForAPI(trip);
};


const getAllTripsByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
        memberships: {
            include: {
                trip: {
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
                }
            }
        }
    }
  })
  const trips = user?.memberships.map(m => m.trip) || [];
  return trips.map(formatTripForAPI);
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
  
  return trip ? formatTripForAPI(trip) : null;
};


const update = async (id: string, data: UpdateTripInput) => {
  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // First, get the current trip to check existing dates
    const currentTrip = await tx.trip.findUnique({
      where: { id },
      include: {
        itinerary: {
          include: {
            days: {
              select: {
                id: true,
                date: true
              }
            }
          }
        }
      }
    });

    if (!currentTrip) {
      throw new Error('Trip not found');
    }


    // Handle date range changes and excluded days
    if ((data.startDate || data.endDate) && currentTrip.startDate && currentTrip.endDate) {
      const newStartDate = data.startDate || currentTrip.startDate;
      const newEndDate = data.endDate || currentTrip.endDate;

      // Get dates that will be excluded from the new range
      const excludedDates = getExcludedDates(
        currentTrip.startDate,
        currentTrip.endDate,
        newStartDate,
        newEndDate
      );

      // If there are excluded dates, find and delete corresponding trip days
      if (excludedDates.length > 0 && currentTrip.itinerary) {
        const excludedDateStrings = excludedDates.map(date => 
          date.toISOString().split('T')[0]
        );
        
        // Find trip days that fall on excluded dates
        const tripDaysToDelete = currentTrip.itinerary.days.filter(day => {
          const dayDateString = day.date.toISOString().split('T')[0];
          return excludedDateStrings.includes(dayDateString);
        });

        // Delete trip days (activities will be automatically deleted due to CASCADE)
        if (tripDaysToDelete.length > 0) {
          const tripDayIds = tripDaysToDelete.map(day => day.id);
          
          await tx.tripDay.deleteMany({
            where: {
              id: {
                in: tripDayIds
              }
            }
          });
        }
      }

      // Create new trip days if the date range expanded
      if (currentTrip.itinerary) {
        // Get all current day dates
        const currentDayDates = currentTrip.itinerary.days.map(day => 
          day.date.toISOString().split('T')[0]
        );

        // Generate all dates in the new range
        const newDates: Date[] = [];
        const current = new Date(newStartDate);
        while (current <= newEndDate) {
          const dateStr = current.toISOString().split('T')[0];
          
          // Only add dates that don't already exist
          if (!currentDayDates.includes(dateStr)) {
            newDates.push(new Date(`${dateStr}T00:00:00.000Z`));
          }
          
          current.setUTCDate(current.getUTCDate() + 1);
        }

        // Create new trip days for expanded dates
        if (newDates.length > 0) {
          const newDaysData = newDates.map(date => ({
            itineraryId: currentTrip.itinerary!.id,
            date: date
          }));

          await tx.tripDay.createMany({
            data: newDaysData
          });
        }
      }
    }
  

    // Update the trip with new data
    const trip = await tx.trip.update({
      where: { id },
      data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.destination !== undefined && { destination: data.destination }),
          ...(data.startDate !== undefined && { startDate: data.startDate }),
          ...(data.endDate !== undefined && { endDate: data.endDate }),
          ...(data.description !== undefined && { description: data.description }),
      },
    });

    return formatTripForAPI(trip);
  });
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
  return trips.map(formatTripForAPI);
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