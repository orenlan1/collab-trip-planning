
export interface Expense {
  id: string;
  description: string;
  cost: number;
  currency: string;
  category: string;
  activityId?: string;
  flightId?: string;
  activity?: { id: string; name: string | null; description: string | null };
  date: string;
  createdAt: string;
  updatedAt: string;
}