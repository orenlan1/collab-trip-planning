import { prisma } from '../prisma/client.js';

const search = async (query: string) => {
    const searchTerm = query.toLowerCase();
    
    return prisma.airline.findMany({
        where: {
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { alias: { contains: searchTerm, mode: 'insensitive' } },
                { callsign: { contains: searchTerm, mode: 'insensitive' } }
            ]
        },
        take: 10,
        orderBy: [
            { name: 'asc' }
        ]
    });
};

export default {
    search
};
