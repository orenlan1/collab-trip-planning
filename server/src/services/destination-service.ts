import { prisma } from '../prisma/client.js';

interface DestinationResult {
  type: 'city' | 'country';
  id: number;
  name: string;
  country?: string;
  tzDatabase: string | null;
}

export const destinationService = {
  async search(query: string): Promise<DestinationResult[]> {
    const searchQuery = query.toLowerCase();

    // Search cities
    const cities = await prisma.city.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
      include: {
        country: true,
      },
      take: 5,
      orderBy: {
        name: 'asc',
      },
    });

    // Search countries
    const countries = await prisma.country.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
      take: 5,
      orderBy: {
        name: 'asc',
      },
    });

    // Combine and format results
    const cityResults: DestinationResult[] = cities.map((city) => ({
      type: 'city' as const,
      id: city.id,
      name: city.name,
      country: city.country.name,
      tzDatabase: city.tzDatabase,
    }));

    const countryResults: DestinationResult[] = countries.map((country) => ({
      type: 'country' as const,
      id: country.id,
      name: country.name,
      tzDatabase: country.tzDatabase,
    }));

    // Return cities first, then countries, limited to 10 total
    return [...cityResults, ...countryResults].slice(0, 10);
  },
};
