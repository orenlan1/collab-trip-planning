import type { TripDay, ApiTripDay } from "./tripDay";

export interface Itinerary {
  id: string;
  days: Array<TripDay>;
}

export interface ApiItinerary {
  id: string;
  tripId: string;
  days: ApiTripDay[];
}