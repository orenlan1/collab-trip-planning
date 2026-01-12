import {prisma} from '../prisma/client.js';
import { formatISO, subDays } from 'date-fns';

const getMessagesForTrip = async (tripId: string, beforeDate?: string, limit: number = 100) => {
    const where: any = { tripId };
    
    if (beforeDate) {
        where.createdAt = {
            lt: new Date(beforeDate)
        };
    }

    const messages = await prisma.message.findMany({
        where,
        include: {
            sender: {
                select: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });

    return messages.reverse().map(msg => ({...msg, createdAt: formatISO(msg.createdAt)}));

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