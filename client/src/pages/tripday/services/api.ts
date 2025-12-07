import axios from 'axios';
import type { TripDay } from '@/types/tripDay';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const tripDaysApi = {
    getTripDay: (tripId: string, dayId: string) => api.get<TripDay>(`/api/trips/${tripId}/itinerary/days/${dayId}`),
    addNewActivity: (tripId: string, dayId: string, data: { name: string; address: string; latitude?: number; longitude?: number }) =>
        api.post(`/api/trips/${tripId}/itinerary/days/${dayId}/activities`,  data ),
    getActivities: (tripId: string, dayId: string) => api.get<TripDay>(`/api/trips/${tripId}/itinerary/days/${dayId}/activities`),
    updateActivity: (tripId: string, activityId: string, data: Partial<{ description: string; startTime: string | null; endTime: string | null; name: string; address: string; image: string; latitude: number; longitude: number }>) =>
      api.patch(`/api/trips/${tripId}/itinerary/activities/${activityId}`, data),
    deleteActivity: (tripId: string, activityId: string) => api.delete(`/api/trips/${tripId}/itinerary/activities/${activityId}`),
};
