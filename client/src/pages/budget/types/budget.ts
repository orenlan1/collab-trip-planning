export type ExpenseCategory = 
  | 'TRANSPORTATION' 
  | 'ACCOMMODATION' 
  | 'ACTIVITIES' 
  | 'FOOD' 
  | 'MISCELLANEOUS';

export interface Budget {
  id: string;
  tripId: string;
  totalPerPerson: number;
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
  activityId: string | null;
  activity?: {
    id: string;
    name: string | null;
    description: string | null;
  } | null;
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
  totalPerPerson: number;
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
  activityId?: string | null;
}
