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

  async getDestinationLatLng(destination : string): Promise<{ latitude: number | null; longitude: number | null } | null> {
    // Try to find the destination as a city first
    if (destination.includes(',')) {
      const cityName = destination.split(',')[0]?.trim();
      const countryName = destination.split(',')[1]?.trim();
      
      if (cityName && countryName) {
        // First find the country to get its ID
        const country = await prisma.country.findFirst({
          where: {
            name: countryName,
          },
          select: {
            id: true
          }
        });

        if (country) {
          // Then find the city with matching name AND country ID
          const city = await prisma.city.findFirst({
            where: {
              name: cityName,
              countryId: country.id
            },
            select: {
              latitude: true,
              longitude: true
            }
          });

          if (city) {
            return {
              latitude: city.latitude,
              longitude: city.longitude
            };
          }
        }
      }  
    } else {   
        const country = await prisma.country.findFirst({
          where: {
            name: destination
          },
          select: {
            latitude: true,
            longitude: true
          }
        });

        if (country) {
          return {
            latitude: country.latitude,
            longitude: country.longitude
          };
        }
    }
    // If not found as either, return null
    return null;
  }
};