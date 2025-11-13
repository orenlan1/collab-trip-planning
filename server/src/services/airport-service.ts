import { prisma } from '../prisma/client.js';

const search = async (query: string) => {
    const searchTerm = query.toLowerCase();
    
    return prisma.airport.findMany({
        where: {
            OR: [
                { iata: { contains: searchTerm, mode: 'insensitive' } },
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { city: { contains: searchTerm, mode: 'insensitive' } },
                { country: { contains: searchTerm, mode: 'insensitive' } }
            ]
        },
        take: 10,
        orderBy: [
            { iata: 'asc' }
        ]
    });
};

export default {
    search
};
