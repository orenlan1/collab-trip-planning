import { prisma } from '../prisma/client.js';
import type { LodgingFormData } from '../controllers/lodging-controller.js';

const create = async (data: LodgingFormData) => {
    return prisma.lodging.create({
        data: {
            tripId: data.tripId,
            name: data.name,
            address: data.address,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
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

const update = async (lodgingId: string, data: Partial<LodgingFormData>) => {
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
