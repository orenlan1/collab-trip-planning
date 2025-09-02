import { create } from "zustand";
import { tripsApi } from "@/pages/trips/services/api";


interface TripData {
  title: string;
  destination?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  image: string | null;
  members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
    };
  }>;
  itinerary: {
    id: string;
  }; 
}

interface TripStore extends TripData {
  setTripData: (tripId: string) => Promise<void>;
  reset: () => void;
}

export const useTripStore = create<TripStore>((set) => ({
  title: '',
  destination: undefined,      // Optional: undefined shows it's not set yet
  description: undefined,      // Optional: undefined shows it's not set yet
  startDate: undefined,        // Optional: undefined for dates that are not set
  endDate: undefined,          // Optional: undefined for dates that are not set
  createdBy: '',
  image: null,                 // null is appropriate for image fields that might be null in API
  members: [],
  itinerary: {
    id: '',
  },
  setTripData: async (tripId: string) => {
    try {
      const response = await tripsApi.getById(tripId);
      set(response.data);
    } catch (error) {
      console.error("Error fetching trip data:", error);
    }
  },
  reset: () => set({
    title: '',
    destination: undefined,
    description: undefined,
    startDate: undefined,
    endDate: undefined,
    createdBy: '',
    image: null,
    members: [],
    itinerary: {
      id: '',
    }
  })
}));