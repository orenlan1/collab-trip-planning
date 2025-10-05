import { create } from 'zustand';
import type { TripDay } from '@/types/tripDay';
import type { Activity } from '@/types/activity';
import { tripDaysApi } from '@/pages/tripday/services/api';

interface TripDayStore {
  tripDay: TripDay | null;
  setTripDay: (tripDay: TripDay | null) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  updateActivity: (activityId: string, updatedActivity: Activity) => void;
}


// Helper function to sort activities
const sortActivities = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    // Activities with no startTime come first
    if (!a.startTime && !b.startTime) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (!a.startTime) return -1;
    if (!b.startTime) return 1;
    
    // Both have startTime, sort by time
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
};



export const useTripDayStore = create<TripDayStore>((set) => ({
  tripDay: null,
  setTripDay: (tripDay) => set({ tripDay }),

  addActivity: (activity) => set(state => ({
    tripDay: state.tripDay ? {
      ...state.tripDay,
      activities: sortActivities([...state.tripDay.activities, activity])
    } : null
  })),
  
  removeActivity: (activityId) => set(state => ({
    tripDay: state.tripDay ? {
      ...state.tripDay,
      activities: state.tripDay.activities.filter(activity => activity.id !== activityId)
    } : null
  })),

  updateActivity: (activityId, updatedActivity) => set(state => ({
    tripDay: state.tripDay ? {
      ...state.tripDay,
      activities: sortActivities(state.tripDay.activities.map(activity => 
        activity.id === activityId ? updatedActivity : activity
      ))
    } : null
  })),

  
}));
