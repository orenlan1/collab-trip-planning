import axios from 'axios';
import type { ApiItinerary } from '@/types/itinerary';
import type { UserPreferences, DraftData } from '@/types/draft';


const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const itinerariesApi = {
  getItinerary: (tripId: string) => api.get<ApiItinerary>(`/api/trips/${tripId}/itinerary`),
  getActivitiesByItinerary: (tripId: string) => api.get(`/api/trips/${tripId}/itinerary/activities`),

  // Draft
  getDraft: (tripId: string) => api.get<DraftData | null>(`/api/trips/${tripId}/itinerary/draft`),
  generateDraft: (tripId: string, preferences: UserPreferences) =>
    api.post(`/api/trips/${tripId}/itinerary/draft/generate`, { preferences }),
  acceptDraft: (tripId: string) => api.post(`/api/trips/${tripId}/itinerary/draft/accept`),
  discardDraft: (tripId: string) => api.post(`/api/trips/${tripId}/itinerary/draft/discard`),
  removeDraftActivity: (tripId: string, tripDayId: string, activityIndex: number) =>
    api.delete(`/api/trips/${tripId}/itinerary/draft/days/${tripDayId}/activities/${activityIndex}`),
};
