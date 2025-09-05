import axios from 'axios';
import type { Itinerary } from '@/stores/itineraryStore';

export type TripDay = {
    id: string;
    date: Date;
    activities: Array<{
      id: string;
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      image?: string;
    }>
};

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});


export const tripDaysApi = {
    addNewActivity: (dayId: string, activity: Omit<TripDay['activities'][number], 'id'>) =>
        api.post(`api/itineraries/days/${dayId}/activities`, activity),
};
