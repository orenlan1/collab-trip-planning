import axios from 'axios';
import type { Itinerary } from '@/stores/itineraryStore';
import type { TripDay } from '@/types/tripDay';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const tripDaysApi = {
    addNewActivity: (dayId: string, data: { name: string, address: string }) =>
        api.post(`api/itineraries/days/${dayId}/activities`,  data ),
    getActivities: (dayId: string) => api.get<TripDay>(`api/itineraries/days/${dayId}/activities`),
    updateActivity: (activityId: string, data: Partial<{ description: string; startTime: string; endTime: string; name: string; address: string; image: string }>) =>
      api.patch(`api/itineraries/activities/${activityId}`, data),
    deleteActivity: (activityId: string) => api.delete(`api/itineraries/activities/${activityId}`),
};
