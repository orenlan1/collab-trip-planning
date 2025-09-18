import type { TripMember } from "./tripMember";

export interface Trip {
  id: string;
  title: string;
  destination?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  image: string | null;
  members: Array<TripMember>;
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