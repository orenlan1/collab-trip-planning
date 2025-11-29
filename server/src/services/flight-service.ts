import { prisma } from '../prisma/client.js';
import type { CreateFlightInput, UpdateFlightInput } from '../schemas/flight-schema.js';
import type { Flight } from '@prisma/client';

const formatFlightTime = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().replace(/\.\d{3}Z$/, '');
};

const formatFlightForAPI = (flight: Flight) => {
    return {
        ...flight,
        departure: formatFlightTime(flight.departure),
        arrival: formatFlightTime(flight.arrival)
    };
};

const create = async (tripId: string, data: CreateFlightInput): Promise<any> => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!trip) {
        throw new Error("Trip not found");
    }

    const flight = await prisma.flight.create({
        data: {
            tripId,
            ...data,
            departureTimezoneId: data.departureTimezoneId || 'UTC',
            arrivalTimezoneId: data.arrivalTimezoneId || 'UTC'
        },
        include: {
            expense: true
        }
    });
    
    return formatFlightForAPI(flight);
};

const getByTripId = async (tripId: string): Promise<any[]> => {
    const flights = await prisma.flight.findMany({
        where: { tripId },
        include: {
            expense: true
        },
        orderBy: {
            departure: 'asc'
        }
    });
    
    return flights.map(formatFlightForAPI);
};

const update = async (flightId: string, data: UpdateFlightInput): Promise<any> => {
    const existingFlight = await prisma.flight.findUnique({
        where: { id: flightId }
    });

    if (!existingFlight) {
        throw new Error("Flight not found");
    }

    const updatedFlight = await prisma.flight.update({
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
            expense: true
        }
    });
    
    return formatFlightForAPI(updatedFlight);
};

const deleteFlight = async (flightId: string, tripId: string): Promise<any> => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!trip) {
        throw new Error("Trip not found");
    }

    const flight = await prisma.flight.findUnique({
        where: { id: flightId }
    });

    if (!flight) {
        throw new Error("Flight not found");
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
