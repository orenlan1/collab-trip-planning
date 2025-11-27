import { Prisma } from '@prisma/client/extension';
import { prisma } from '../prisma/client.js';
import type { CreateFlightInput, UpdateFlightInput } from '../schemas/flight-schema.js';

/**
 * Formats flight times for API response (removes milliseconds from ISO string)
 * @param date - Date object to format
 * @returns ISO string without milliseconds or null
 */
const formatFlightTime = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().replace(/\.\d{3}Z$/, '');
};

/**
 * Formats flight data for API response
 * @param flight - Flight object with Date fields
 * @returns Flight object with formatted time strings
 */
const formatFlightForAPI = (flight: any) => {
    return {
        ...flight,
        departure: formatFlightTime(flight.departure),
        arrival: formatFlightTime(flight.arrival)
    };
};

/**
 * Builds activity data from flight information
 */
const buildActivityDataFromFlight = (
    flightData: {
        to: string;
        airline: string;
        flightNumber: string;
        from: string;
        departure: Date | string;
        arrival: Date | string;
    }
): {
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
} => {
    return {
        name: `Flight to ${flightData.to}`,
        description: `${flightData.airline} ${flightData.flightNumber} from ${flightData.from} to ${flightData.to}`,
        startTime: new Date(flightData.departure),
        endTime: new Date(flightData.arrival)
    };
};

/**
 * Creates an activity for a flight
 */
const createActivityForFlight = async (
    flight: any,
    tripDayId: string,
    tx?: any
): Promise<any> => {
    const client = tx || prisma;
    const activityData = buildActivityDataFromFlight(flight);
    
    return client.activity.create({
        data: {
            tripDayId,
            ...activityData,
            address: null,
            image: null
        }
    });
};

/**
 * Finds the trip day that matches the flight departure date
 */
const findTripDayForFlight = async (
    itineraryId: string,
    flightDate: Date,
    tx?: any
): Promise<any | null> => {
    const client = tx || prisma;
    const flightDateStr = flightDate.toISOString().split('T')[0];
    
    const tripDays = await client.tripDay.findMany({
        where: { itineraryId }
    });
    
    return tripDays.find((day: any) => {
        const dayDateStr = day.date.toISOString().split('T')[0];
        return dayDateStr === flightDateStr;
    }) || null;
};

/**
 * Syncs activity data with updated flight information
 * Merges partial flight updates with existing flight data
 */
const syncActivityWithFlight = async (
    activityId: string,
    partialFlightData: Partial<UpdateFlightInput>,
    existingFlight: any,
    tx: any
): Promise<void> => {
    // Merge partial updates with existing flight data
    const mergedFlightData = {
        to: partialFlightData.to ?? existingFlight.to,
        airline: partialFlightData.airline ?? existingFlight.airline,
        flightNumber: partialFlightData.flightNumber ?? existingFlight.flightNumber,
        from: partialFlightData.from ?? existingFlight.from,
        departure: partialFlightData.departure ?? existingFlight.departure,
        arrival: partialFlightData.arrival ?? existingFlight.arrival
    };

    // Build complete activity data from merged flight data
    const activityData = buildActivityDataFromFlight(mergedFlightData);

    // Update activity with all fields at once
    await tx.activity.update({
        where: { id: activityId },
        data: activityData
    });
};

/**
 * Creates a flight with optional activity creation if trip has dates
 */
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

    const shouldCreateActivity = trip.startDate && trip.endDate;
    let activityId: string | null = null;

    if (shouldCreateActivity) {
        const tripDay = await findTripDayForFlight(trip.itinerary!.id, new Date(data.departure));
        
        if (tripDay) {
            const activity = await createActivityForFlight(data, tripDay.id);
            activityId = activity.id;
        }
    }

    const flight = await prisma.flight.create({
        data: {
            tripId,
            ...data,
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
    
    return formatFlightForAPI(flight);
};

/**
 * Retrieves all flights for a trip
 */
const getByTripId = async (tripId: string): Promise<any[]> => {
    const flights = await prisma.flight.findMany({
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
    
    return flights.map(formatFlightForAPI);
};

/**
 * Updates a flight and syncs changes to its linked activity
 */
const update = async (flightId: string, data: UpdateFlightInput): Promise<any> => {
    const existingFlight = await prisma.flight.findUnique({
        where: { id: flightId },
        include: {
            activity: true
        }
    });

    if (!existingFlight) {
        throw new Error("Flight not found");
    }

    return await prisma.$transaction(async (tx) => {
        // Update flight with conditional fields
        const updatedFlight = await tx.flight.update({
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
            },
            include: {
                activity: {
                    include: {
                        expense: true
                    }
                }
            }
        });

        // Sync activity if linked
        if (existingFlight.activityId) {
            await syncActivityWithFlight(
                existingFlight.activityId,
                data,
                existingFlight,
                tx
            );
        }
        
        return formatFlightForAPI(updatedFlight);
    });
};

/**
 * Deletes a flight and its associated activity
 */
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

    // Delete associated activity if exists (cascade will handle expense)
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
