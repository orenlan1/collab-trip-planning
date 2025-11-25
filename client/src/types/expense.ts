
export interface Expense {
  id: string;
  description: string;
  cost: number;
  currency: string;
  category: string;
  activityId: string | null;
  activity: { id: string; name: string | null; description: string | null } | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}