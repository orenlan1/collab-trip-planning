import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip } from "@/types/trip";
import { flightsApi, type Flight } from "@/pages/flights/services/api";


interface TripStore extends Trip {
  flights: Flight[];
  setTripData: (trip: Trip) => Promise<void>;
  setDescription: (description: string) => void;
  setDestination: (destination: string) => void;
  setFlights: (flights: Flight[]) => void;
  addFlight: (flight: Flight) => void;
  updateFlight: (flightId: string, updatedFlight: Flight) => void;
  deleteFlight: (flightId: string) => void;
  fetchFlights: (tripId: string) => Promise<void>;
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
    flights: [],
    setTripData: async (trip: Trip) => {
      set({ ...trip });
    },
    setDescription: (description: string) => set({ description }),
    setDestination: (destination: string) => set({ destination }),
    setFlights: (flights: Flight[]) => set({ flights }),
    addFlight: (flight: Flight) => set((state) => ({ flights: [...state.flights, flight] })),
    updateFlight: (flightId: string, updatedFlight: Flight) => set((state) => ({
      flights: state.flights.map(flight => 
        flight.id === flightId ? updatedFlight : flight
      )
    })),
    deleteFlight: (flightId: string) => set((state) => ({
      flights: state.flights.filter(flight => flight.id !== flightId)
    })),
    fetchFlights: async (tripId: string) => {
      try {
        const response = await flightsApi.getAll(tripId);
        set({ flights: response.data });
      } catch (error) {
        console.error('Failed to fetch flights:', error);
      }
    },
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
      },
      flights: [],
    })
  }),
  {
    name: "trip-storage",
    partialize: (state) => ({
      itinerary: state.itinerary,
    })
  }
));