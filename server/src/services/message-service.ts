import {prisma} from '../prisma/client.js';
import { formatISO } from 'date-fns';

const getMessagesForTrip = async (tripId: string) => {
    const messages = await prisma.message.findMany({
        where: { tripId },
        include: {
            sender: {
                select: {
                    name: true,
                    image: true,
                }
            }
        }
    });

    return messages.map(msg => ({...msg, createdAt: formatISO(msg.createdAt)}));

};

const createMessage = async (tripId: string, senderId: string, content: string) => {
    const message = await prisma.message.create({
        data: {
            tripId,
            senderId,
            content,
        },
        include: {
            sender: {
                select: {
                    name: true,
                    image: true,
                }
            }
        }
    });
    return {...message, createdAt: formatISO(message.createdAt)};
};

export default { getMessagesForTrip, createMessage };