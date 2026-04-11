import axios from 'axios';
import type { ApiItinerary } from '@/types/itinerary';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const itinerariesApi = {
  getItinerary: (tripId: string) => api.get<ApiItinerary>(`/api/trips/${tripId}/itinerary`),
  getActivitiesByItinerary: (tripId: string) => api.get(`/api/trips/${tripId}/itinerary/activities`),
};