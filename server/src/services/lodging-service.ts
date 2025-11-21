import { prisma } from '../prisma/client.js';
import type { CreateLodgingInput, UpdateLodgingInput } from '../schemas/lodging-schema.js';

const create = async (data: CreateLodgingInput, tripId: string) => {
    const isTripExists = await prisma.trip.findUnique({
        where: { id: tripId }
    });

    if (!isTripExists) {
        throw new Error("Trip not found");
    }

    return prisma.lodging.create({
        data: {
            tripId: tripId,
            name: data.name,
            address: data.address,
            checkIn: data.checkIn!,
            checkOut: data.checkOut!,
            guests: data.guests
        }
    });
};

const getByTripId = async (tripId: string) => {
    return prisma.lodging.findMany({
        where: { tripId },
        orderBy: {
            checkIn: 'asc'
        }
    });
};

const update = async (lodgingId: string, data: UpdateLodgingInput) => {
    const isLodgingExists = await prisma.lodging.findUnique({
        where: { id: lodgingId }
    });

    if (!isLodgingExists) {
        throw new Error("Lodging not found");
    }

    return prisma.lodging.update({
        where: { id: lodgingId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.checkIn !== undefined && { checkIn: data.checkIn }),
            ...(data.checkOut !== undefined && { checkOut: data.checkOut }),
            ...(data.guests !== undefined && { guests: data.guests })
        }
    });
};

const deleteLodging = async (lodgingId: string) => {
    return prisma.lodging.delete({
        where: { id: lodgingId }
    });
};

export default {
    create,
    getByTripId,
    update,
    delete: deleteLodging
};
