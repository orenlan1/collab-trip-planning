import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip } from "@/types/trip";
import { flightsApi, type Flight } from "@/pages/flights/services/api";
import { lodgingsApi, type Lodging } from "@/pages/lodging/services/api";


interface TripStore extends Trip {
  flights: Flight[];
  lodgings: Lodging[];
  setTripData: (trip: Trip) => Promise<void>;
  setDescription: (description: string) => void;
  setDestination: (destination: string) => void;
  setFlights: (flights: Flight[]) => void;
  addFlight: (flight: Flight) => void;
  updateFlight: (flightId: string, updatedFlight: Flight) => void;
  deleteFlight: (flightId: string) => void;
  fetchFlights: (tripId: string) => Promise<void>;
  setLodgings: (lodgings: Lodging[]) => void;
  addLodging: (lodging: Lodging) => void;
  updateLodging: (lodgingId: string, updatedLodging: Lodging) => void;
  deleteLodging: (lodgingId: string) => void;
  fetchLodgings: (tripId: string) => Promise<void>;
  reset: () => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
    id: '',
    title: '',
    destination: '',      // Optional: undefined shows it's not set yet
    description: undefined,      // Optional: undefined shows it's not set yet
    startDate: undefined,        // Optional: undefined for dates that are not set
    endDate: undefined,
    latitude: null,
    longitude: null,
    createdBy: '',
    image: null,                 // null is appropriate for image fields that might be null in API
    members: [],
    itinerary: {
      id: '',
    },
    flights: [],
    lodgings: [],
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
    setLodgings: (lodgings: Lodging[]) => set({ lodgings }),
    addLodging: (lodging: Lodging) => set((state) => ({ lodgings: [...state.lodgings, lodging] })),
    updateLodging: (lodgingId: string, updatedLodging: Lodging) => set((state) => ({
      lodgings: state.lodgings.map(lodging => 
        lodging.id === lodgingId ? updatedLodging : lodging
      )
    })),
    deleteLodging: (lodgingId: string) => set((state) => ({
      lodgings: state.lodgings.filter(lodging => lodging.id !== lodgingId)
    })),
    fetchLodgings: async (tripId: string) => {
      try {
        const response = await lodgingsApi.getAll(tripId);
        set({ lodgings: response.data });
      } catch (error) {
        console.error('Failed to fetch lodgings:', error);
      }
    },
    reset: () => set({
      id: '',
      title: '',
      destination: undefined,
      description: undefined,
      startDate: undefined,
      endDate: undefined,
      latitude: null,
      longitude: null,
      createdBy: '',
      image: null,
      members: [],
      itinerary: {
        id: '',
      },
      flights: [],
      lodgings: [],
    })
  }),
  {
    name: "trip-storage",
    partialize: (state) => ({
      itinerary: state.itinerary,
    })
  }
));