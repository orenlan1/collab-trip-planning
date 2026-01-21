
export interface ExpenseSplit {
  id: string;
  memberId: string;
  share: number;
  member: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}

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
  splits?: ExpenseSplit[];
  createdAt: string;
  updatedAt: string;
}