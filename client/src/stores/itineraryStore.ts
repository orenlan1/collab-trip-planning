
import { create } from "zustand";
import { itinerariesApi } from "@/pages/itineraries/services/api";
import { persist } from "zustand/middleware";

interface TripDay {
  id: string;
  date: Date;
  activities: Activity[];
}

interface Activity {
  id: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  name?: string;
  address?: string;
  image?: string;
}

export interface Itinerary {
  days: Array<TripDay>;
}

interface ItineraryStore extends Itinerary {
  isLoading: boolean;
  error: string | null;
  selectedDayId: string | null;
  setItineraryData: (itineraryId: string) => Promise<void>;
  setActivities: (day: TripDay, activities: Activity[]) => void;
  selectDay: (dayId: string) => void;
  addActivity: (dayId: string, activity: Activity) => void;
  reset: () => void;
}

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      days: [],
      isLoading: false,
      error: null,
      selectedDayId: null,
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
      setActivities: (day : TripDay, activities: Activity[]) => set(state => ({
        days: state.days.map(d => 
          d.id === day.id ? { ...d, activities } : d
        )
      })),
      selectDay: (dayId: string) => set({ selectedDayId: dayId }),
      addActivity: (dayId: string, activity: Activity) => set(state => ({
        days: state.days.map(day => 
          day.id === dayId 
            ? { ...day, activities: [...(day.activities || []), activity] } 
            : day
        )
      })),
      reset: () => set({
        days: [],
        isLoading: false,
        error: null,
        selectedDayId: null
      })
    }),
    {
      name: "itinerary-storage", // name of the item in storage
    }
));
