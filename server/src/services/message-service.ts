import {prisma} from '../prisma/client.js';

const getMessagesForTrip = async (tripId: string) => {
    return prisma.message.findMany({
        where: { tripId },
    });
};

const createMessage = async (tripId: string, senderId: string, content: string) => {
    return prisma.message.create({
        data: {
            tripId,
            senderId,
            content,
        },
    });
};

export default { getMessagesForTrip, createMessage };