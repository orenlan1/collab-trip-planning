import axios from 'axios';
import type { Itinerary } from '@/stores/itineraryStore';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const itinerariesApi = {
    getItinerary: (id: string) => api.get<Itinerary>(`api/itineraries/${id}`),  
};