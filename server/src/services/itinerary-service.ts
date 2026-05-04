import { prisma } from '../prisma/client.js';
import type { TripDayFormData, ActivityFormData } from '../controllers/itinerary-controller.js';
import { fetchImageURL } from '../apiClients/unsplash/images.js';
import { normalizeDate, formatTripDayForAPI } from '../lib/utils.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { generateDraftDay } from '../apiClients/openai/itinerary.js';
import type { UserPreferences, DraftData, DraftDay, DraftActivity, DayTravelContext } from '../apiClients/openai/itinerary.js';
import { resolvePlaceByName } from '../apiClients/google-maps/places.js';

const formatActivityTime = (date: Date | null): string | null => {
    if (!date) return null;
    return date.toISOString().replace(/\.\d{3}Z$/, ''); // "2025-09-12T07:00:00.000Z" → "2025-09-12T07:00:00"
};

const formatActivityForAPI = (activity: any) => {
    return {
        ...activity,
        startTime: formatActivityTime(activity.startTime),
        endTime: formatActivityTime(activity.endTime)
    };
};

const createItineraryDays = async (itineraryId: string, startDate: Date | string, endDate: Date | string) => {
    const days = [];

    // Normalize dates using utility function
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    
    if (!start || !end) {
        throw new BadRequestError('Invalid start or end date provided');
    }

    // Use while loop for clearer logic
    let currentDate = new Date(start);
    while (currentDate <= end) {
        // Store the date with the correct year, month, day at UTC midnight
        const dateStr = currentDate.toISOString().split('T')[0];
        const dateToStore = new Date(`${dateStr}T00:00:00.000Z`);
        
        days.push({
            itineraryId,
            date: dateToStore
        });
        
        // Move to next day (using UTC methods to avoid DST issues)
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    await prisma.tripDay.createMany({
        data: days
    });

    // Fetch and return the created days with formatted dates
    const createdDays = await prisma.tripDay.findMany({
        where: {
            itineraryId
        },
        orderBy: {
            date: 'asc'
        }
    });
    
    return createdDays.map(formatTripDayForAPI);
}


const getById = async (itineraryId: string) => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
            days: {
                include: {
                    activities: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    });
    
    if (!itinerary) return null;
    
   return {
        ...itinerary,
        days: itinerary.days.map(day => ({
            ...formatTripDayForAPI(day),
            activities: day.activities.map(formatActivityForAPI)
        }))
    };
};

const getByTripId = async (tripId: string) => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { tripId },
        include: {
            days: {
                include: {
                    activities: {
                        orderBy: {
                            createdAt: 'asc'
                        }
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    });
    
    if (!itinerary) return null;
    
   return {
        ...itinerary,
        days: itinerary.days.map(day => ({
            ...formatTripDayForAPI(day),
            activities: day.activities.map(formatActivityForAPI)
        }))
    };
};

const getTripDay = async (tripDayId: string) => {
    const tripDay = await prisma.tripDay.findUnique({
        where: { id: tripDayId },
        include: {
            activities: {
                orderBy: [
                    { startTime: { sort: 'asc', nulls: 'first' } },
                    { createdAt: 'asc' } 
                ],
                include: {
                    expense: true
                }
            }
        }
    });

    if (!tripDay) return null;

    tripDay.activities = tripDay.activities.map(formatActivityForAPI);
    return formatTripDayForAPI(tripDay);
};

const addTripDay = async (itineraryId: string, data: TripDayFormData) => {
    return prisma.tripDay.create({
        data: {
            itineraryId,
            date: data.date
        },
        include: {
            activities: true
        }
    });
};

const addActivity = async (tripDayId: string, data: ActivityFormData) => {
    data.image = data.image || (data.name ? await fetchImageURL(data.name) : undefined);

    return prisma.activity.create({
        data: {
            tripDayId,
            description: data.description || null,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            name: data.name || null,
            address: data.address || null,
            image: data.image || null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null
        }
    });
};

const updateActivity = async (activityId: string, data: Partial<ActivityFormData>) => {
    console.log("Updating activity:", data);
    const activity = await prisma.activity.update({
        where: { id: activityId },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.startTime !== undefined && { startTime: data.startTime ? new Date(data.startTime + 'Z') : null }),
            ...(data.endTime !== undefined && { endTime: data.endTime ? new Date(data.endTime + 'Z') : null }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.image !== undefined && { image: data.image }),
            ...(data.latitude !== undefined && { latitude: data.latitude }),
            ...(data.longitude !== undefined && { longitude: data.longitude })
        }
    });

    return formatActivityForAPI(activity);
};

const deleteActivity = async (activityId: string) => {
    return prisma.activity.delete({
        where: { id: activityId }
    });
};

const deleteTripDay = async (tripDayId: string) => {
    return prisma.tripDay.delete({
        where: { id: tripDayId }
    });
};

const getActivities = async (tripDayId: string) => {
    return prisma.tripDay.findUnique({
        where: {id : tripDayId},
        include: {
            activities: true
        }
    })
}

const getActivitiesByItinerary = async (itineraryId: string) => {
    // Find activities across all trip days for the given itinerary
    const activities = await prisma.activity.findMany({
        where: {
            tripDay: {
                itineraryId
            }
        },
        include: {
            expense: true
        },
        orderBy: [
            { startTime: { sort: 'asc', nulls: 'first' } },
            { createdAt: 'asc' }
        ]
    });

    return activities.map(formatActivityForAPI);
}

const getActivityById = async (activityId: string) => {
    return prisma.activity.findUnique({
        where: { id: activityId }
    });
}

// ─── Draft: place resolution ──────────────────────────────────────────────────

const enrichActivity = async (activity: DraftActivity): Promise<DraftActivity> => {
    const isExperiential = activity.type === 'neighborhood_walk' || activity.type === 'experience' || activity.type === 'day_trip';

    if (isExperiential) {
        // Geocode startingPoint for the map pin and use its text as the address
        const [imageUrl, geocoded] = await Promise.all([
            fetchImageURL(activity.name).catch(() => null),
            activity.startingPoint ? resolvePlaceByName(activity.startingPoint).catch(() => null) : Promise.resolve(null),
        ]);
        return {
            ...activity,
            imageUrl,
            ...(geocoded && {
                lat:     geocoded.lat,
                lon:     geocoded.lon,
                address: activity.startingPoint, // show the same location as the map pin
            }),
        };
    }

    // For specific places: resolve via Google Places + Unsplash image
    const [resolved, imageUrl] = await Promise.all([
        resolvePlaceByName(activity.searchQuery).catch(() => null),
        fetchImageURL(activity.name).catch(() => null),
    ]);

    if (!resolved) return { ...activity, imageUrl };

    return {
        ...activity,
        address:  resolved.address,
        lat:      resolved.lat,
        lon:      resolved.lon,
        imageUrl,
    };
};

// ─── Draft: travel context helpers ───────────────────────────────────────────

const getLocalDateStr = (date: Date, timezoneId: string): string =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: timezoneId,
        year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(date);

const getLocalTimeStr = (date: Date, timezoneId: string): string =>
    new Intl.DateTimeFormat('en-GB', {
        timeZone: timezoneId,
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(date);

type FlightRow  = { arrival: Date; arrivalTimezoneId: string; departure: Date; departureTimezoneId: string; from: string; to: string };
type LodgingRow = { name: string; address: string; checkIn: Date; checkOut: Date };

const buildDayTravelContext = (
    dateStr:  string,
    flights:  FlightRow[],
    lodgings: LodgingRow[],
): DayTravelContext | undefined => {
    const ctx: DayTravelContext = {};

    const arrivalFlight = flights.find(f => getLocalDateStr(f.arrival, f.arrivalTimezoneId) === dateStr);
    if (arrivalFlight) {
        ctx.arrivalFlight = {
            localTime: getLocalTimeStr(arrivalFlight.arrival, arrivalFlight.arrivalTimezoneId),
            from:      arrivalFlight.from,
        };
    }

    const departureFlight = flights.find(f => getLocalDateStr(f.departure, f.departureTimezoneId) === dateStr);
    if (departureFlight) {
        ctx.departureFlight = {
            localTime: getLocalTimeStr(departureFlight.departure, departureFlight.departureTimezoneId),
            to:        departureFlight.to,
        };
    }

    const lodging = lodgings.find(l => {
        const checkIn  = getLocalDateStr(l.checkIn,  'UTC');
        const checkOut = getLocalDateStr(l.checkOut, 'UTC');
        return dateStr >= checkIn && dateStr <= checkOut;
    });
    if (lodging) {
        ctx.lodging = { name: lodging.name, address: lodging.address };
    }

    if (!ctx.arrivalFlight && !ctx.departureFlight && !ctx.lodging) return undefined;
    return ctx;
};

// ─── Draft: generate ──────────────────────────────────────────────────────────

const generateDraft = async (
    tripId: string,
    preferences: UserPreferences,
    emitDayReady: (day: DraftDay) => void,
    emitError: (msg: string) => void
): Promise<void> => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { tripId },
        include: {
            trip: { include: { flights: true, lodgings: true } },
            days: { include: { activities: true }, orderBy: { date: 'asc' } },
            draft: true,
        },
    });

    if (!itinerary) throw new NotFoundError('Itinerary not found');

    if (itinerary.draft) {
        await prisma.itineraryDraft.delete({ where: { itineraryId: itinerary.id } });
    }

    const { trip } = itinerary;

    // Track activity names used across days to avoid repetition
    const usedNames: string[] = itinerary.days.flatMap(d => d.activities.map(a => a.name ?? '').filter(Boolean));

    const allGeneratedDays: DraftDay[] = [];

    for (let i = 0; i < itinerary.days.length; i++) {
        const day     = itinerary.days[i]!;
        const dateStr = day.date.toISOString().split('T')[0]!;

        try {
            const travelContext = buildDayTravelContext(dateStr, trip.flights, trip.lodgings);

            const rawDay = await generateDraftDay({
                tripDayId:   day.id,
                date:        dateStr,
                dayNumber:   i + 1,
                totalDays:   itinerary.days.length,
                destination: trip.destination,
                preferences,
                alreadyUsed: usedNames,
                ...(travelContext ? { travelContext } : {}),
            });

            // Resolve places and images in parallel
            const enrichedActivities = await Promise.all(rawDay.activities.map(enrichActivity));
            const enrichedDay: DraftDay = { ...rawDay, activities: enrichedActivities };

            enrichedDay.activities.forEach(a => usedNames.push(a.name));

            allGeneratedDays.push(enrichedDay);
            emitDayReady(enrichedDay);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            emitError(`Failed to generate Day ${i + 1}: ${msg}`);
            return;
        }
    }

    const draftData: DraftData = { days: allGeneratedDays };
    await prisma.itineraryDraft.create({
        data: { itineraryId: itinerary.id, data: draftData as object },
    });
};

// ─── Draft: get ───────────────────────────────────────────────────────────────

const getDraft = async (tripId: string): Promise<DraftData | null> => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { tripId },
        include: { draft: true },
    });
    if (!itinerary?.draft) return null;
    return itinerary.draft.data as unknown as DraftData;
};

// ─── Draft: accept ────────────────────────────────────────────────────────────

const acceptDraft = async (tripId: string): Promise<void> => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { tripId },
        include: { draft: true },
    });

    if (!itinerary?.draft) throw new NotFoundError('No draft found');

    const draftData = itinerary.draft.data as unknown as DraftData;

    for (const day of draftData.days) {
        for (const activity of day.activities) {
            if (activity.removed) continue;

            const suggestions = activity.suggestions?.length
                ? activity.suggestions as object[]
                : undefined;

            await prisma.activity.create({
                data: {
                    tripDayId:   day.tripDayId,
                    name:        activity.name,
                    description: activity.description || null,
                    address:     activity.address     || null,
                    latitude:    activity.lat         ?? null,
                    longitude:   activity.lon         ?? null,
                    image:       activity.imageUrl    || null,
                    ...(suggestions ? { suggestions } : {}),
                },
            });
        }
    }

    await prisma.itineraryDraft.delete({ where: { itineraryId: itinerary.id } });
};

// ─── Draft: discard ───────────────────────────────────────────────────────────

const discardDraft = async (tripId: string): Promise<void> => {
    const itinerary = await prisma.itinerary.findUnique({ where: { tripId } });
    if (!itinerary) throw new NotFoundError('Itinerary not found');
    await prisma.itineraryDraft.deleteMany({ where: { itineraryId: itinerary.id } });
};

// ─── Draft: remove activity ───────────────────────────────────────────────────

const removeDraftActivity = async (
    tripId: string,
    tripDayId: string,
    activityIndex: number
): Promise<DraftData> => {
    const itinerary = await prisma.itinerary.findUnique({
        where: { tripId },
        include: { draft: true },
    });
    if (!itinerary?.draft) throw new NotFoundError('No draft found');

    const draftData = itinerary.draft.data as unknown as DraftData;
    const day = draftData.days.find(d => d.tripDayId === tripDayId);
    if (!day) throw new NotFoundError('Day not found in draft');

    if (activityIndex < 0 || activityIndex >= day.activities.length) {
        throw new BadRequestError('Invalid activity index');
    }

    day.activities[activityIndex]!.removed = true;

    await prisma.itineraryDraft.update({
        where: { itineraryId: itinerary.id },
        data: { data: draftData as object },
    });

    return draftData;
};

export default {
    getById,
    getByTripId,
    getTripDay,
    addTripDay,
    addActivity,
    updateActivity,
    deleteActivity,
    deleteTripDay,
    createItineraryDays,
    getActivities,
    getActivitiesByItinerary,
    getActivityById,
    // Draft operations
    generateDraft,
    getDraft,
    acceptDraft,
    discardDraft,
    removeDraftActivity,
};
