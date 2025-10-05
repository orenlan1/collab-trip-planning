
import { create } from "zustand";
import { itinerariesApi } from "@/pages/itineraries/services/api";
import { persist } from "zustand/middleware";
import { tripDaysApi } from "@/pages/tripday/services/api";
import { formatItineraryFromAPI } from "@/lib/utils";
import type { TripDay } from "@/types/tripDay";
import type { Activity } from "@/types/activity";
import type { Itinerary } from "@/types/itinerary";



interface ItineraryStore extends Itinerary {
  isLoading: boolean;
  error: string | null;
  selectedDayId: string | null;
  setItineraryData: (itinerary: Itinerary) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActivities: (day: TripDay, activities: Activity[]) => void;
  selectDay: (dayId: string) => void;
  reset: () => void;
}

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      days: [],
      id: " ",
      isLoading: false,
      error: null,
      setItineraryData: async (itinerary: Itinerary) => {
        set({ ...itinerary });
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      
      setError: (error: string | null) => set({ error }),

      setActivities: (day : TripDay, activities: Activity[]) => set(state => ({
        days: state.days.map(d => 
          d.id === day.id ? { ...d, activities } : d
        )
      })),
      selectDay: (dayId: string) => set({ selectedDayId: dayId }),

      reset: () => set({
        days: [],
        isLoading: false,
        error: null,
        selectedDayId: null
      }),

      selectedDayId: null,
    }),
    {
      name: "itinerary-storage", // name of the item in storage
      partialize: (state) => ({
        selectedDayId: state.selectedDayId,
        }),
    }
));
