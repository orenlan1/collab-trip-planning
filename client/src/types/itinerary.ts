import type { TripDay } from "./tripDay";

export interface Itinerary {
  id: string;
  days: Array<TripDay>;
}