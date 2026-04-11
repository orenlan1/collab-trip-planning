import type { Activity } from "./activity";

export interface TripDay {
  id: string;
  date: Date;
  activities: Activity[];
}

export interface ApiTripDay {
  id: string;
  itineraryId: string;
  date: string;
  activities: Activity[];
}