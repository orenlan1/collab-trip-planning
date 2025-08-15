import { prisma } from '../prisma/client.js';
const create = async (data, creatorId) => {
    const trip = await prisma.trip.create({
        data: {
            title: data.title,
            ...(data.destination !== undefined && { destination: data.destination }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.startDate !== undefined && { startDate: data.startDate }),
            ...(data.endDate !== undefined && { endDate: data.endDate }),
            createdById: creatorId,
            members: {
                create: {
                    userId: creatorId,
                    role: "creator"
                }
            }
        },
    });
    return trip;
};
const getAllTripsByUserId = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            memberships: {
                include: {
                    trip: true
                }
            }
        }
    });
    return user?.memberships.map(m => m.trip) || [];
};
const getTripById = async (id) => {
    const trip = await prisma.trip.findUnique({
        where: { id },
    });
    return trip;
};
const update = async (id, data) => {
    const trip = await prisma.trip.update({
        where: { id },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.destination !== undefined && { destination: data.destination }),
            ...(data.startDate !== undefined && { startDate: data.startDate }),
            ...(data.endDate !== undefined && { endDate: data.endDate }),
        }
    });
    return trip;
};
const deleteTripById = async (id) => {
    const trip = await prisma.trip.delete({
        where: { id },
    });
    return trip;
};
export default {
    create,
    getAllTripsByUserId,
    getTripById,
    update,
    deleteTripById
};
//# sourceMappingURL=trip-service.js.map