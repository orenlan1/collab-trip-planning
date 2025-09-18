import type { Activity } from "./activity";

export interface TripDay {
  id: string;
  date: Date;
  activities: Activity[];
}