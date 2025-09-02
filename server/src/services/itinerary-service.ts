import { prisma } from '../prisma/client.js';
import type { ItineraryFormData, TripDayFormData, ActivityFormData } from '../controllers/itinerary-controller.js';


const createItineraryDays = async (itineraryId: string, startDate: Date | string, endDate: Date | string) => {
    const days = [];

    // Handle both Date objects and date strings (YYYY-MM-DD)
    // Extract just the date portion to ensure consistency
    const startDateStr = typeof startDate === 'string' 
        ? startDate 
        : startDate instanceof Date 
            ? startDate.toISOString().split('T')[0] 
            : String(startDate).split('T')[0];
            
    const endDateStr = typeof endDate === 'string' 
        ? endDate 
        : endDate instanceof Date 
            ? endDate.toISOString().split('T')[0] 
            : String(endDate).split('T')[0];
    
    
    // Create dates at UTC midnight for consistent date comparison and storage
    const start = new Date(`${startDateStr}T00:00:00.000Z`);
    const end = new Date(`${endDateStr}T00:00:00.000Z`);
    

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

    // Fetch and return the created days
    return prisma.tripDay.findMany({
        where: {
            itineraryId
        },
        orderBy: {
            date: 'asc'
        }
    });
}


const getById = async (itineraryId: string) => {
    return prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
            days: {
                include: {
                    activities: true
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    });
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
    return prisma.activity.create({
        data: {
            tripDayId,
            title: data.title,
            description: data.description || null,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            location: data.location || null,
            image: data.image || null
        }
    });
};

const updateActivity = async (activityId: string, data: Partial<ActivityFormData>) => {
    return prisma.activity.update({
        where: { id: activityId },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.startTime !== undefined && { startTime: data.startTime }),
            ...(data.endTime !== undefined && { endTime: data.endTime }),
            ...(data.location !== undefined && { location: data.location }),
            ...(data.image !== undefined && { image: data.image })
        }
    });
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

export default {
    getById,
    addTripDay,
    addActivity,
    updateActivity,
    deleteActivity,
    deleteTripDay,
    createItineraryDays
};
