import { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { budgetApi } from './services/budgetApi';
import { useTripStore } from '@/stores/tripStore';
import { itinerariesApi } from '../itineraries/services/api';
import type { BudgetSummary, ExpenseCategory } from './types/budget';
import type { Activity } from '@/types/activity';
import { BudgetOverviewCards } from './components/BudgetOverviewCards';
import { BudgetCategories } from './components/BudgetCategories';
import { BudgetSummaryChart } from './components/BudgetSummaryChart';
import { SetBudgetDialog } from './components/SetBudgetDialog';
import { AddExpenseDialog } from './components/AddExpenseDialog';
import { EditExpenseDialog } from './components/EditExpenseDialog';
import { DeleteExpenseDialog } from './components/DeleteExpenseDialog';
import { ExpensesList } from './components/ExpensesList';
import type { Expense } from '@/types/expense';


export function TripBudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesPagination, setExpensesPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [showSetBudgetDialog, setShowSetBudgetDialog] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);
  const [showDeleteExpenseDialog, setShowDeleteExpenseDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const itineraryId = useTripStore(state => state.itinerary.id);

  const fetchActivities = async (): Promise<void> => {
    if (!itineraryId) return;

    try {
      const response = await itinerariesApi.getActivitiesByItinerary(itineraryId);
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching activities by itinerary:', error);
    }
  };

  const fetchExpenses = async (page: number = 1, append: boolean = false): Promise<void> => {
    if (!tripId) return;

    try {
      setIsLoadingExpenses(true);
      const response = await budgetApi.getExpenses(tripId, page, 5);
      
      if (append) {
        setExpenses(prev => [...prev, ...response.data.expenses]);
      } else {
        setExpenses(response.data.expenses);
      }
      
      setExpensesPagination({
        page: response.data.pagination.page,
        hasMore: response.data.pagination.hasMore,
        total: response.data.pagination.total
      });
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleLoadMoreExpenses = (): void => {
    const nextPage = expensesPagination.page + 1;
    fetchExpenses(nextPage, true);
  };

  const fetchBudgetSummary = async (): Promise<void> => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await budgetApi.getSummary(tripId);
      setSummary(response.data);
    } catch (error: any) {
      console.error('Error fetching budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary();
    fetchActivities();
    fetchExpenses();
  }, [tripId]);

  const handleSetBudget = async (totalPerPerson: number, currency: string): Promise<void> => {
    if (!tripId) return;

    try {
      await budgetApi.createOrUpdateBudget(tripId, { totalPerPerson, currency });
      toast.success('Budget set successfully!');
      await fetchBudgetSummary();
    } catch (error: any) {
      throw error;
    }
  };

  const handleAddExpense = async (description: string, cost: number, category: ExpenseCategory, activityId?: string, currency?: string, date?: string): Promise<void> => {
    if (!tripId) return;

    try {
      await budgetApi.addExpense(tripId, { description, cost, category, activityId, currency, date });
      toast.success('Expense added successfully!');
      
      await fetchBudgetSummary();
      await fetchActivities();
      await fetchExpenses();
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditExpense = async (expenseId: string, description: string, cost: number, category: ExpenseCategory, currency?: string, date?: string): Promise<void> => {
    try {
      await budgetApi.updateExpense(expenseId, { description, cost, category, currency, date });
      setShowEditExpenseDialog(false);
      setSelectedExpense(null);
      toast.success('Expense updated successfully!');
      
      await fetchBudgetSummary();
      await fetchActivities();
      await fetchExpenses();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string): Promise<void> => {
    try {
      await budgetApi.deleteExpense(expenseId);
      toast.success('Expense deleted successfully!');
      
      await fetchBudgetSummary();
      await fetchActivities();
      await fetchExpenses();
    } catch (error: any) {
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  const handleOpenEditDialog = (expense: Expense): void => {
    setSelectedExpense(expense);
    setShowEditExpenseDialog(true);
  };

  const handleOpenDeleteDialog = (expense: Expense): void => {
    setSelectedExpense(expense);
    setShowDeleteExpenseDialog(true);
  };

  if (isLoading || !summary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
        <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <BudgetOverviewCards 
        summary={summary} 
        onEditBudget={() => setShowSetBudgetDialog(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BudgetCategories 
            summary={summary} 
            onAddExpense={() => setShowAddExpenseDialog(true)}
          />
          
          <ExpensesList 
            expenses={expenses}
            hasMore={expensesPagination.hasMore}
            isLoading={isLoadingExpenses}
            onLoadMore={handleLoadMoreExpenses}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        </div>

        <BudgetSummaryChart summary={summary} />
      </div>

      <SetBudgetDialog
        open={showSetBudgetDialog}
        onOpenChange={setShowSetBudgetDialog}
        onSubmit={handleSetBudget}
        defaultCurrency={summary.currency}
        defaultTotalPerPerson={summary.totalPerPerson ?? undefined}
      />

      <AddExpenseDialog
        open={showAddExpenseDialog}
        activities={activities}
        onOpenChange={setShowAddExpenseDialog}
        onSubmit={handleAddExpense}
      />

      {showEditExpenseDialog && selectedExpense && (
        <EditExpenseDialog
          key={selectedExpense.id}
          open={showEditExpenseDialog}
          expense={selectedExpense}
          onOpenChange={(open) => {
            setShowEditExpenseDialog(open);
            if (!open) {
              setSelectedExpense(null);
            }
          }}
          onSubmit={handleEditExpense}
        />
      )}

      <DeleteExpenseDialog
        open={showDeleteExpenseDialog}
        expense={selectedExpense}
        onOpenChange={(open) => {
          setShowDeleteExpenseDialog(open);
          if (!open) {
            setSelectedExpense(null);
          }
        }}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}
