import axios from 'axios';
import type { Budget, BudgetSummary, CreateBudgetInput, CreateExpenseInput } from '../types/budget';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Budget API Response:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Budget API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const budgetApi = {
  // Create or update a trip's budget
  createOrUpdateBudget: (tripId: string, data: CreateBudgetInput) => {
    console.log('API: Creating/updating budget for trip:', tripId, data);
    return api.post<Budget>(`/trips/${tripId}/budget`, data);
  },

  // Get budget with expenses
  getBudget: (tripId: string) => {
    console.log('API: Getting budget for trip:', tripId);
    return api.get<Budget>(`/trips/${tripId}/budget`);
  },

  // Add an expense
  addExpense: (tripId: string, data: CreateExpenseInput) => {
    console.log('API: Adding expense for trip:', tripId, data);
    return api.post(`/trips/${tripId}/budget/expenses`, data);
  },

  // Update an expense
  updateExpense: (expenseId: string, data: Partial<CreateExpenseInput>) => {
    console.log('API: Updating expense:', expenseId, data);
    return api.patch(`/budget/expenses/${expenseId}`, data);
  },

  // Delete an expense
  deleteExpense: (expenseId: string) => {
    console.log('API: Deleting expense:', expenseId);
    return api.delete(`/budget/expenses/${expenseId}`);
  },

  // Get budget summary
  getSummary: (tripId: string) => {
    console.log('API: Getting summary for trip:', tripId);
    return api.get<BudgetSummary>(`/trips/${tripId}/budget/summary`);
  },
};
