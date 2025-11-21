import { prisma } from '../prisma/client.js';
import type { FlightFormData } from '../controllers/flight-controller.js';
import type { CreateFlightInput, UpdateFlightInput } from '../schemas/flight-schema.js';

/**
 * Creates an activity for a flight
 * @param flight - The flight data
 * @param tripDayId - The trip day ID where the activity should be created
 * @param tx - Optional transaction client
 * @returns The created activity
 */
const createActivityForFlight = async (flight: any, tripDayId: string, tx?: any): Promise<any> => {
    const activityName = `Flight to ${flight.to}`;
    const client = tx || prisma;
    
    return client.activity.create({
        data: {
            tripDayId,
            name: activityName,
            startTime: flight.departure,
            endTime: flight.arrival,
            description: `${flight.airline} ${flight.flightNumber} from ${flight.from} to ${flight.to}`,
            address: null,
            image: null
        }
    });
};

/**
 * Finds the trip day that matches the flight departure date
 * @param itineraryId - The itinerary ID
 * @param flightDate - The flight departure date
 * @param tx - Optional transaction client
 * @returns The matching trip day or null
 */
const findTripDayForFlight = async (itineraryId: string, flightDate: Date, tx?: any): Promise<any | null> => {
    const flightDateStr = flightDate.toISOString().split('T')[0];
    const client = tx || prisma;
    
    const tripDays = await client.tripDay.findMany({
        where: { itineraryId }
    });
    
    return tripDays.find((day: any) => {
        const dayDateStr = day.date.toISOString().split('T')[0];
        return dayDateStr === flightDateStr;
    }) || null;
};

const create = async (tripId: string, data: CreateFlightInput): Promise<any> => {

    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
            itinerary: {
                select: { id: true }
            }
        }
    });

    if (!trip) {
        throw new Error("Trip not found");
    }

    // Check if trip has dates and itinerary
    const shouldCreateActivity = trip.startDate && trip.endDate && trip.itinerary;

    let activityId: string | null = null;

    if (shouldCreateActivity) {
        // Find the trip day that matches the flight departure date
        const tripDay = await findTripDayForFlight(trip.itinerary!.id, new Date(data.departure));
        
        if (tripDay) {
            // Create the flight data structure
            const tempFlight = {
                flightNumber: data.flightNumber,
                airline: data.airline,
                departure: data.departure,
                arrival: data.arrival,
                from: data.from,
                to: data.to
            };
            
            // Create activity for the flight
            const activity = await createActivityForFlight(tempFlight, tripDay.id);
            activityId = activity.id;
        }
    }

    return prisma.flight.create({
        data: {
            tripId,
            flightNumber: data.flightNumber,
            airline: data.airline,
            departure: data.departure,
            arrival: data.arrival,
            from: data.from,
            to: data.to,
            departureTimezoneId: data.departureTimezoneId || 'UTC',
            arrivalTimezoneId: data.arrivalTimezoneId || 'UTC',
            ...(activityId && { activityId })
        },
        include: {
            activity: {
                include: {
                    expense: true
                }
            }
        }
    });
};

const getByTripId = async (tripId: string): Promise<any[]> => {
    return prisma.flight.findMany({
        where: { tripId },
        include: {
            activity: {
                include: {
                    expense: true
                }
            }
        },
        orderBy: {
            departure: 'asc'
        }
    });
};

const update = async (flightId: string, data: UpdateFlightInput): Promise<any> => {
    
    const isFlightExists = await prisma.flight.findUnique({
        where: { id: flightId }
    });

    if (!isFlightExists) {
        throw new Error("Flight not found");
    }

    return prisma.flight.update({
        where: { id: flightId },
        data: {
            ...(data.flightNumber !== undefined && { flightNumber: data.flightNumber }),
            ...(data.airline !== undefined && { airline: data.airline }),
            ...(data.departure !== undefined && { departure: data.departure }),
            ...(data.arrival !== undefined && { arrival: data.arrival }),
            ...(data.from !== undefined && { from: data.from }),
            ...(data.to !== undefined && { to: data.to }),
            ...(data.departureTimezoneId !== undefined && { departureTimezoneId: data.departureTimezoneId }),
            ...(data.arrivalTimezoneId !== undefined && { arrivalTimezoneId: data.arrivalTimezoneId })
        }
    });
};

const deleteFlight = async (flightId: string, tripId: string): Promise<any> => {

    const trip = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!trip) {
        throw new Error("Trip not found");
    }

    const flight = await prisma.flight.findUnique({
        where: { id: flightId },
        include: { activity: true }
    });

    if (!flight) {
        throw new Error("Flight not found");
    }

    // Delete associated activity if it exists
    if (flight.activityId) {
        await prisma.activity.delete({
            where: { id: flight.activityId }
        });
    }

    return prisma.flight.delete({
        where: { id: flightId }
    });
};

export default {
    create,
    getByTripId,
    update,
    delete: deleteFlight
};

export { createActivityForFlight, findTripDayForFlight };
