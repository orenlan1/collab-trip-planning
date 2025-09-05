
import { create } from "zustand";
import { itinerariesApi } from "@/pages/itineraries/services/api";

export interface Itinerary {
  days: Array<{
    id: string;
    date: Date;
    activities: Array<{
      id: string;
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      image?: string;
    }>
  }>
}

interface ItineraryStore extends Itinerary {
  isLoading: boolean;
  error: string | null;
  setItineraryData: (itineraryId: string) => Promise<void>;
  reset: () => void;
}

export const useItineraryStore = create<ItineraryStore>((set) => ({
  days: [],
  isLoading: false,
  error: null,
  setItineraryData: async (itineraryId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await itinerariesApi.getItinerary(itineraryId);
      set({ ...response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching itinerary data:", error);
      set({ 
        error: "Failed to load itinerary data", 
        isLoading: false 
      });
    }
  },
  reset: () => set({
    days: [],
    isLoading: false,
    error: null
  })
}))