import { prisma } from '../prisma/client.js';
import type { FlightFormData } from '../controllers/flight-controller.js';

const create = async (data: FlightFormData) => {
    return prisma.flight.create({
        data: {
            tripId: data.tripId,
            flightNumber: data.flightNumber,
            airline: data.airline,
            departure: data.departure,
            arrival: data.arrival,
            from: data.from,
            to: data.to
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

const update = async (flightId: string, data: Partial<FlightFormData>) => {
    return prisma.flight.update({
        where: { id: flightId },
        data: {
            ...(data.flightNumber !== undefined && { flightNumber: data.flightNumber }),
            ...(data.airline !== undefined && { airline: data.airline }),
            ...(data.departure !== undefined && { departure: data.departure }),
            ...(data.arrival !== undefined && { arrival: data.arrival }),
            ...(data.from !== undefined && { from: data.from }),
            ...(data.to !== undefined && { to: data.to })
        }
    });
};

const deleteFlight = async (flightId: string) => {
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
