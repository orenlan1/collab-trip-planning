import { prisma } from '../prisma/client.js';
import type { FlightFormData } from '../controllers/flight-controller.js';
import type { CreateFlightInput, UpdateFlightInput } from '../schemas/flight-schema.js';


const create = async (tripId: string, data: CreateFlightInput) => {

    const isTripExists = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!isTripExists) {
        throw new Error("Trip not found");
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
            arrivalTimezoneId: data.arrivalTimezoneId || 'UTC'
        }
    });
};

const getByTripId = async (tripId: string) => {
    return prisma.flight.findMany({
        where: { tripId },
        orderBy: {
            departure: 'asc'
        }
    });
};

const update = async (flightId: string, data: UpdateFlightInput) => {
    
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

const deleteFlight = async (flightId: string, tripId: string) => {

    const isTripExists = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!isTripExists) {
        throw new Error("Trip not found");
    }

    const isFlightExists = await prisma.flight.findUnique({
        where: { id: flightId }
    });

    if (!isFlightExists) {
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
