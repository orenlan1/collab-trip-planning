import axios from 'axios';
import type { Itinerary } from '@/types/itinerary';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const itinerariesApi = {
  getItinerary: (id: string) => api.get<Itinerary>(`api/itineraries/${id}`),
  getActivitiesByItinerary: (itineraryId: string) => api.get(`/api/itineraries/${itineraryId}/activities`),
};