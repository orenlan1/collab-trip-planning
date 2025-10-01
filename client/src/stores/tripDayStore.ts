import { create } from 'zustand';
import type { TripDay } from '@/types/tripDay';
import type { Activity } from '@/types/activity';
import { tripDaysApi } from '@/pages/tripday/services/api';

interface TripDayStore {
  tripDay: TripDay | null;
  setTripDay: (tripDay: TripDay | null) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
}

export const useTripDayStore = create<TripDayStore>((set) => ({
  tripDay: null,
  setTripDay: (tripDay) => set({ tripDay }),

  addActivity: (activity) => set(state => ({
    tripDay: state.tripDay ? {
      ...state.tripDay,
      activities: [...state.tripDay.activities, activity]
    } : null
  })),
  
  removeActivity: (activityId) => set(state => ({
    tripDay: state.tripDay ? {
      ...state.tripDay,
      activities: state.tripDay.activities.filter(activity => activity.id !== activityId)
    } : null
  })),
}));
