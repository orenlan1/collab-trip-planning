import axios from 'axios';
import type { TripDay } from '@/types/tripDay';
import type { CreateActivityRequest } from '@/types/activity';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  location: Location;
  whyRecommended: string;
}

interface DiningSuggestionsResponse {
  query: string;
  restaurants: Restaurant[];
}


export const tripDaysApi = {
    getTripDay: (tripId: string, dayId: string) => api.get<TripDay>(`/api/trips/${tripId}/itinerary/days/${dayId}`),
    addNewActivity: (tripId: string, dayId: string, data: CreateActivityRequest) =>
        api.post(`/api/trips/${tripId}/itinerary/days/${dayId}/activities`,  data ),
    getActivities: (tripId: string, dayId: string) => api.get<TripDay>(`/api/trips/${tripId}/itinerary/days/${dayId}/activities`),
    updateActivity: (tripId: string, activityId: string, data: Partial<{ description: string; startTime: string | null; endTime: string | null; name: string; address: string; image: string; latitude: number; longitude: number }>) =>
      api.patch(`/api/trips/${tripId}/itinerary/activities/${activityId}`, data),
    deleteActivity: (tripId: string, activityId: string) => api.delete(`/api/trips/${tripId}/itinerary/activities/${activityId}`),
};

export const diningApi = {
  getDiningSuggestions: (tripId: string, query: string, destination: string) => 
    api.get<DiningSuggestionsResponse>(`/api/trips/${tripId}/itinerary/dining/suggestions`, {
      params: { query, destination }
    }),
};
