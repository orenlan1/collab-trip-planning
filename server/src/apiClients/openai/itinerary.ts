import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod/v4';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Public types ────────────────────────────────────────────────────────────

export interface UserPreferences {
    pace:               'relaxed' | 'moderate' | 'packed';
    interests:          string[];
    budgetTier:         'budget' | 'mid-range' | 'luxury';
    groupType:          'solo' | 'couple' | 'family' | 'friends';
    exclusions:         string[];   // e.g. ["churches", "museums"]
    dayTripWillingness: 'yes' | 'no' | 'maybe';
}

export interface DayTravelContext {
    arrivalFlight?: {
        localTime: string;   // "22:30"
        from:      string;   // e.g. "New York (JFK)"
    };
    departureFlight?: {
        localTime: string;   // "07:15"
        to:        string;   // e.g. "London (LHR)"
    };
    lodging?: {
        name:    string;
        address: string;
    };
}

export interface ActivitySuggestion {
    name: string;
    url?: string;
}

export interface DraftActivity {
    name:          string;
    description:   string;
    timeSlot:      'morning' | 'afternoon' | 'evening';
    type:          'attraction' | 'food' | 'experience' | 'neighborhood_walk' | 'day_trip' | 'event';
    address:       string | null;
    lat:           number | null;
    lon:           number | null;
    imageUrl:      string | null;
    removed:       boolean;
    searchQuery:   string;
    startingPoint: string | null;    // e.g. "Start at Náměstí Míru" for walks/nightlife
    suggestions:   ActivitySuggestion[]; // specific venues for experiential activities
}

export interface DraftDay {
    tripDayId:  string;
    date:       string;
    theme:      string;
    activities: DraftActivity[];
}

export interface DraftData {
    days: DraftDay[];
}

// ─── Zod schema for structured output ────────────────────────────────────────

const SuggestionSchema = z.object({
    name: z.string(),
    url:  z.string().nullable(), // null when URL is not known
});

const ActivitySchema = z.object({
    name:              z.string(),
    description:       z.string(),
    timeSlot:          z.enum(['morning', 'afternoon', 'evening']),
    type:              z.enum(['attraction', 'food', 'experience', 'neighborhood_walk', 'day_trip', 'event']),
    searchQuery:       z.string(),
    isResolvedByPlace: z.boolean(),
    startingPoint:     z.string().nullable(), // null for attractions/food; set for walks/nightlife/cruises
    suggestions:       z.array(SuggestionSchema), // empty array for attractions/food
});

const DraftDaySchema = z.object({
    theme:      z.string(),
    activities: z.array(ActivitySchema).min(1).max(4),
});

// ─── Slot counts by pace ──────────────────────────────────────────────────────

const ACTIVITIES_BY_PACE: Record<UserPreferences['pace'], number> = {
    relaxed:  2,
    moderate: 3,
    packed:   4,
};

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert travel planner who creates memorable, story-driven itineraries.

Your job is to plan a single day of a trip. The plan must feel like a real curated experience, not a list of random POIs.

Rules:
- Give each day a clear geographic theme (e.g. "Old Town & Charles Bridge", "Castle District & Malá Strana") — activities should be clustered in the same neighborhood where possible.
- The day should tell a story: activities flow naturally from one to the next. Morning sets the tone, afternoon deepens it, evening is social or relaxing.
- description must be 2-4 engaging sentences of narrative prose explaining what to do, what to see, what makes it special. Write as if recommending to a friend.
- Group type matters enormously:
  - solo: independent, flexible, mix of culture and personal discovery
  - couple: romantic spots, intimate restaurants, scenic walks, couple-friendly experiences
  - family: kid-friendly pacing, outdoor spaces, interactive experiences, shorter museum visits
  - friends: social energy, local bars, shared experiences, nightlife where appropriate
- Budget tier influences venue choices: budget = free/cheap, luxury = upscale venues and experiences.
- Day trips (type: day_trip) should only be suggested if dayTripWillingness is "yes" or "maybe". Place them on Day 3 or Day 4 — once the group has settled in, a day trip feels like a natural mid-trip adventure. Never on Day 1 or the last day.
- neighborhood_walk, experience, and day_trip activities do not have a single fixed place — describe the area or activity.
- For attraction, food, event types: set isResolvedByPlace = true. For neighborhood_walk, experience, day_trip: set isResolvedByPlace = false.
- searchQuery should be specific enough to find the right place on Google Maps (e.g. "Charles Bridge Prague", "Lokál Dlouhá Prague pub").
- For neighborhood_walk, experience, day_trip, and nightlife activities: always provide startingPoint — the actual meeting point or start of THIS activity itself (e.g., for a park: "Park HaYarkon, Rokach Blvd, Tel Aviv"; for a street walk: "Dizengoff Center, Dizengoff St, Tel Aviv"). NEVER use the previous activity's location as the startingPoint. Also provide 2-3 suggestions of real named venues (bars, clubs, cruise operators, restaurants) that fit the activity.
- For attraction and food types: startingPoint must be null and suggestions must be an empty array.
- URLs in suggestions: ONLY include a url if you are certain it is the venue's real, working official website (e.g. "https://www.lokalbeer.cz"). If you are not 100% sure the URL is correct, set url to null — never guess. Each suggestion across all activities in this day must be a different venue; do not repeat the same venue in multiple activities.
- Avoid activities that are nearly identical to each other or to anything in alreadyUsed. If two activities share the same physical location, they must serve a clearly different purpose.
- Avoid repeating any activity names from the alreadyUsed list.
- If a "Travel context" section is listed in the user message, it OVERRIDES normal day planning. Use common sense about travel logistics:
  - Arrival flight: factor in airport → accommodation transfer time (typically 1–2 hours in most cities). If arrival is in the evening, plan only light low-effort activities (dinner near hotel, short neighborhood walk). If arriving late at night, plan at most 1 activity or none, with a restful theme. Never schedule sightseeing before the group has had time to settle in.
  - Departure flight: account for the full pre-flight window — check-out, travel to airport, and security (typically 2–3 hours before flight). Nothing should run into this window. If departure is early morning, plan at most 1 light activity (farewell breakfast near hotel). If departure is very early, plan 0 activities and use a short farewell theme.
  - Lodging address: use it as the geographic anchor — prioritize activities within walking distance or a short commute, especially on arrival and departure days.
- If real events are listed, weave them into the day naturally where they fit the time slot.
- Respect exclusions strictly — if "churches" is excluded, never suggest a church or cathedral.`;

// ─── Travel context formatter ─────────────────────────────────────────────────

function buildTravelContextNote(ctx?: DayTravelContext): string {
    if (!ctx) return '';
    const lines: string[] = ['Travel context for this day:'];
    if (ctx.arrivalFlight) {
        lines.push(`- Arrival flight landing at ${ctx.arrivalFlight.localTime} local time, arriving from ${ctx.arrivalFlight.from}.`);
    }
    if (ctx.departureFlight) {
        lines.push(`- Departure flight at ${ctx.departureFlight.localTime} local time, flying to ${ctx.departureFlight.to}.`);
    }
    if (ctx.lodging) {
        lines.push(`- Accommodation: ${ctx.lodging.name}, ${ctx.lodging.address}.`);
    }
    return '\n' + lines.join('\n');
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateDraftDay(params: {
    tripDayId:     string;
    date:          string;
    dayNumber:     number;
    totalDays:     number;
    destination:   string;
    preferences:   UserPreferences;
    alreadyUsed:   string[];
    travelContext?: DayTravelContext;
}): Promise<DraftDay> {
    const { tripDayId, date, dayNumber, totalDays, destination, preferences, alreadyUsed, travelContext } = params;

    const targetActivities = ACTIVITIES_BY_PACE[preferences.pace];

    const exclusionsNote = preferences.exclusions.length
        ? `Strictly exclude these types of places/activities: ${preferences.exclusions.join(', ')}.`
        : '';

    const dayTripNote = preferences.dayTripWillingness === 'no'
        ? 'Do NOT suggest day trips outside the city.'
        : preferences.dayTripWillingness === 'maybe'
        ? 'A day trip outside the city is acceptable if it is truly iconic.'
        : 'A day trip outside the city is welcome if it fits the group.';

    const travelContextNote = buildTravelContextNote(travelContext);
    const hasFlightConstraint = !!(travelContext?.arrivalFlight || travelContext?.departureFlight);

    const paceLine = hasFlightConstraint
        ? `Pace preference: ${preferences.pace} (overridden by Travel context below)`
        : `Pace: ${preferences.pace} — plan exactly ${targetActivities} activities`;

    const planLine = hasFlightConstraint
        ? `Plan activities for this day. The Travel context above is a hard constraint — it may result in 0, 1, or 2 activities regardless of pace. Give the day a theme that reflects its travel situation.`
        : `Plan ${targetActivities} activities for this day. Give the day a geographic theme and make it feel like a real trip experience.`;

    const userPrompt = `Destination: ${destination}
Day ${dayNumber} of ${totalDays} (${date})
Group: ${preferences.groupType}
${paceLine}
Interests: ${preferences.interests.join(', ')}
Budget: ${preferences.budgetTier}
${exclusionsNote}
${dayTripNote}
Already used activity names (do not repeat): ${alreadyUsed.length ? alreadyUsed.join(', ') : 'none'}
${travelContextNote}
${planLine}`;

    const response = await openai.chat.completions.parse({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userPrompt },
        ],
        response_format: zodResponseFormat(DraftDaySchema, 'day'),
    });

    const parsed = response.choices[0]?.message.parsed;
    if (!parsed) throw new Error('No structured response from OpenAI');

    const activities: DraftActivity[] = parsed.activities.map(a => ({
        name:          a.name,
        description:   a.description,
        timeSlot:      a.timeSlot,
        type:          a.type,
        searchQuery:   a.searchQuery,
        address:       null,
        lat:           null,
        lon:           null,
        imageUrl:      null,
        removed:       false,
        startingPoint: a.startingPoint ?? null,
        suggestions:   a.suggestions.map(s => s.url ? { name: s.name, url: s.url } : { name: s.name }),
    }));

    return { tripDayId, date, theme: parsed.theme, activities };
}
