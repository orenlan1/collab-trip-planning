export type ExpenseCategory = 
  | 'TRANSPORTATION' 
  | 'ACCOMMODATION' 
  | 'ACTIVITIES' 
  | 'FOOD' 
  | 'MISCELLANEOUS';

export interface Budget {
  id: string;
  tripId: string;
  totalPerPerson: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  expenses: Expense[];
  expensesByCategory: Record<ExpenseCategory, number>;
}

export interface Expense {
  id: string;
  budgetId: string;
  description: string;
  cost: number;
  category: ExpenseCategory;
  currency: string;
  date: string;
  activityId: string | null;
  activity?: {
    id: string;
    name: string | null;
    description: string | null;
    tripDay?: {
      date: string;
    } | null;
  } | null;
  flightId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  TRANSPORTATION: number;
  ACCOMMODATION: number;
  ACTIVITIES: number;
  FOOD: number;
  MISCELLANEOUS: number;
  totalSpent: number;
  totalBudget: number;
  totalPerPerson: number | null;
  numberOfMembers: number;
  remaining: number;
  currency: string;
}

export interface CreateBudgetInput {
  totalPerPerson: number;
  currency: string;
}

export interface CreateExpenseInput {
  description: string;
  cost: number;
  category: ExpenseCategory;
  currency?: string;
  activityId?: string | null;
  flightId?: string | null;
  lodgingId?: string | null;
  date?: string;
  splitMemberIds?: string[];
}
