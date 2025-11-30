import type { TripMember } from "./tripMember";

export interface Trip {
  id: string;
  title: string;
  destination?: string;
  description?: string;
  startDate?: string; // ISO string format from API
  endDate?: string;   // ISO string format from API
  createdBy: string;
  image: string | null;
  members: Array<TripMember>;
  latitude: number | null;
  longitude: number | null;
  itinerary: {
    id: string;
  }; 
}


export interface UpdateTripRequest {
  title?: string;
  description?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
}