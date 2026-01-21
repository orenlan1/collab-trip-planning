import {prisma} from '../prisma/client.js';
import type {TripFormData, TripUpdateData } from '../controllers/trip-controller.js';
import itineraryService from './itinerary-service.js';
import { getExcludedDates, normalizeDate, formatTripForAPI } from '../lib/utils.js';
import type { CreateTripInput, UpdateTripInput } from '../schemas/trip-schema.js';
import { destinationService } from './destination-service.js';
const MAX_TRIP_DURATION_DAYS = 365;

/**
 * Generate array of dates between start and end date (inclusive)
 * @param startDate - Trip start date
 * @param endDate - Trip end date
 * @returns Array of Date objects representing each day in the range
 * @throws Error if date range is invalid or exceeds maximum duration
 */
const generateDateRange = (startDate: Date, endDate: Date): Date[] => {
  if (endDate < startDate) {
    throw new Error('End date must be after start date');
  }

  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  let dayCount = 0;
  
  while (current <= end && dayCount < MAX_TRIP_DURATION_DAYS) {
    const dateStr = current.toISOString().split('T')[0];
    dates.push(new Date(`${dateStr}T00:00:00.000Z`));
    current.setUTCDate(current.getUTCDate() + 1);
    dayCount++;
  }
  
  if (dayCount >= MAX_TRIP_DURATION_DAYS) {
    throw new Error(`Trip duration exceeds maximum allowed length of ${MAX_TRIP_DURATION_DAYS} days`);
  }
  
  return dates;
};


const create = async (data: CreateTripInput, creatorId: string) => {
  let location: { latitude: number | null; longitude: number | null } = { latitude: null, longitude: null };
  if (data.destination) {
    location = await destinationService.getDestinationLatLng(data.destination) || { latitude: null, longitude: null };
  }

  const trip = await prisma.trip.create({
    data: {
      ...data,
      latitude: location.latitude,
      longitude: location.longitude,
      createdById: creatorId,
      members: {
        create: {
            userId: creatorId,
            role: "creator"
        }
      },
      itinerary: {
        create: {}
      },
      budget: {
        create: {
          currency: "USD"
        }
      }
    },
    include: {
      itinerary: true,
      budget: true
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
                        id: true,
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
          id: true,
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

    // Case 1: Initial date setting - trip has no dates yet but dates are being added
    if (!currentTrip.startDate && !currentTrip.endDate && data.startDate && data.endDate) {
      if (!currentTrip.itinerary) {
        throw new Error('Trip itinerary not found');
      }

      // Generate date range with validation
      const newDates = generateDateRange(data.startDate, data.endDate);

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
    // Case 2: Date range modification - trip has existing dates and they're being changed
    else if ((data.startDate || data.endDate) && currentTrip.startDate && currentTrip.endDate) {
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

        // Generate all dates in the new range with validation
        const allDatesInRange = generateDateRange(newStartDate, newEndDate);
        
        // Filter to only include dates that don't already exist
        const newDates = allDatesInRange.filter(date => {
          const dateStr = date.toISOString().split('T')[0];
          return !currentDayDates.includes(dateStr);
        });

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

    let location: { latitude: number | null; longitude: number | null } = { latitude: null, longitude: null };
    if (data.destination) {
      location = await destinationService.getDestinationLatLng(data.destination) || { latitude: null, longitude: null };
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
          latitude: location.latitude && location.latitude,
          longitude: location.longitude && location.longitude,
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