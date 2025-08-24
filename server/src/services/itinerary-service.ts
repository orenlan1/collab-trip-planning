import { prisma } from '../prisma/client.js';
import type { ItineraryFormData, TripDayFormData, ActivityFormData } from '../controllers/itinerary-controller.js';


const createItineraryDays = async (itineraryId: string, startDate: Date, endDate: Date) => {
    const days = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        days.push({
            itineraryId,
            date: new Date(date)
        });
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


const getByTripId = async (tripId: string) => {
    return prisma.itinerary.findUnique({
        where: { tripId },
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
    getByTripId,
    addTripDay,
    addActivity,
    updateActivity,
    deleteActivity,
    deleteTripDay,
    createItineraryDays
};
