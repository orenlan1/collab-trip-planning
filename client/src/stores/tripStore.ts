import { create } from "zustand";
import { tripsApi } from "@/pages/trips/services/api";
import { persist } from "zustand/middleware";
import { formatTripFromAPI } from "@/lib/utils";
import type { Trip } from "@/types/trip";


interface TripStore extends Trip {
  setTripData: (tripId: string) => Promise<void>;
  setDescription: (description: string) => void;
  reset: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
    id: '',
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
        // Convert API response (ISO strings) to store format (Date objects)
        const tripData = formatTripFromAPI(response.data);
        set(tripData);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    },
    setDescription: (description: string) => set({ description }),
    reset: () => set({
      id: '',
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
  }),
  {
    name: "trip-storage",
    partialize: (state) => ({
      itinerary: state.itinerary,
    })
  }
));