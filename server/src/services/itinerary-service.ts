import { prisma } from '../prisma/client.js';
import type { ItineraryFormData, TripDayFormData, ActivityFormData } from '../controllers/itinerary-controller.js';
import { fetchImageURL } from '../apiClients/unsplash/images.js';
import { normalizeDate, formatTripDayForAPI } from '../lib/utils.js';

const formatActivityTime = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().replace(/\.\d{3}Z$/, ''); // "2025-09-12T07:00:00.000Z" → "2025-09-12T07:00:00"
};

const formatActivityForAPI = (activity: any) => {
    return {
        ...activity,
        startTime: formatActivityTime(activity.startTime),
        endTime: formatActivityTime(activity.endTime)
    };
};

const createItineraryDays = async (itineraryId: string, startDate: Date | string, endDate: Date | string) => {
    const days = [];

    // Normalize dates using utility function
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    
    if (!start || !end) {
        throw new Error('Invalid start or end date provided');
    }

    // Use while loop for clearer logic
    let currentDate = new Date(start);
    while (currentDate <= end) {
        // Store the date with the correct year, month, day at UTC midnight
        const dateStr = currentDate.toISOString().split('T')[0];
        const dateToStore = new Date(`${dateStr}T00:00:00.000Z`);
        
        days.push({
            itineraryId,
            date: dateToStore
        });
        
        // Move to next day (using UTC methods to avoid DST issues)
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    await prisma.tripDay.createMany({
        data: days
    });

    // Fetch and return the created days with formatted dates
    const createdDays = await prisma.tripDay.findMany({
        where: {
            itineraryId
        },
        orderBy: {
            date: 'asc'
        }
    });
    
    return createdDays.map(formatTripDayForAPI);
}


const getById = async (itineraryId: string) => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
            days: {
                include: {
                    activities: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    });
    
    if (!itinerary) return null;
    
   return {
        ...itinerary,
        days: itinerary.days.map(day => ({
            ...formatTripDayForAPI(day),
            activities: day.activities.map(formatActivityForAPI)
        }))
    };
};

const getTripDay = async (tripDayId: string) => {
    const tripDay = await prisma.tripDay.findUnique({
        where: { id: tripDayId },
        include: {
            activities: {
                orderBy: [
                    { startTime: { sort: 'asc', nulls: 'first' } },
                    { createdAt: 'asc' }
                ]
            }
        }
    });

    if (!tripDay) return null;

    tripDay.activities = tripDay.activities.map(formatActivityForAPI);
    return formatTripDayForAPI(tripDay);
};

const addTripDay = async (itineraryId: string, data: TripDayFormData) => {
    return prisma.tripDay.create({
        data: {
            itineraryId,
            date: data.date
        },
        include: {
            activities: true
        }
    });
};

const addActivity = async (tripDayId: string, data: ActivityFormData) => {
    data.image = data.image || (data.name ? await fetchImageURL(data.name) : undefined);

    return prisma.activity.create({
        data: {
            tripDayId,
            description: data.description || null,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            name: data.name || null,
            address: data.address || null,
            image: data.image || null
        }
    });
};

const updateActivity = async (activityId: string, data: Partial<ActivityFormData>) => {
    console.log("Updating activity:", data);
    const activity = await prisma.activity.update({
        where: { id: activityId },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.startTime !== undefined && { startTime: data.startTime ? new Date(data.startTime + 'Z') : null }),
            ...(data.endTime !== undefined && { endTime: data.endTime ? new Date(data.endTime + 'Z') : null }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.image !== undefined && { image: data.image })
        }
    });

    return formatActivityForAPI(activity);
};

const deleteActivity = async (activityId: string) => {
    return prisma.activity.delete({
        where: { id: activityId }
    });
};

const deleteTripDay = async (tripDayId: string) => {
    return prisma.tripDay.delete({
        where: { id: tripDayId }
    });
};

const getActivities = async (tripDayId: string) => {
    return prisma.tripDay.findUnique({
        where: {id : tripDayId},
        include: {
            activities: true
        }
    })
}

export default {
    getById,
    getTripDay,
    addTripDay,
    addActivity,
    updateActivity,
    deleteActivity,
    deleteTripDay,
    createItineraryDays,
    getActivities
};
