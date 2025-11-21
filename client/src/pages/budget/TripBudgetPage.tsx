import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { budgetApi } from './services/budgetApi';
import { useTripStore } from '@/stores/tripStore';
import { itinerariesApi } from '../itineraries/services/api';
import type { BudgetSummary, ExpenseCategory } from './types/budget';
import type { Activity } from '@/types/activity';
import { EmptyBudgetState } from './components/EmptyBudgetState';
import { BudgetOverviewCards } from './components/BudgetOverviewCards';
import { BudgetCategories } from './components/BudgetCategories';
import { BudgetSummaryChart } from './components/BudgetSummaryChart';
import { SetBudgetDialog } from './components/SetBudgetDialog';
import { AddExpenseDialog } from './components/AddExpenseDialog';

export function TripBudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetBudgetDialog, setShowSetBudgetDialog] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);

  const itineraryId = useTripStore(state => state.itinerary.id);

  const fetchActivities = async () => {
    if (!itineraryId) return;

    try {
      const response = await itinerariesApi.getActivitiesByItinerary(itineraryId);
      // response.data should be an array of activities
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching activities by itinerary:', error);
    }
  };

  const fetchBudgetSummary = async () => {
    if (!tripId) {
      console.log('No tripId found');
      setIsLoading(false);
      return;
    }
    
    console.log('Fetching budget summary for trip:', tripId);
    
    try {
      setIsLoading(true);
      const response = await budgetApi.getSummary(tripId);
      console.log('Budget summary response:', response.data);
      setSummary(response.data);
    } catch (error: any) {
      console.error('Error fetching budget:', error);
      if (error.response?.status === 404) {
        console.log('Budget not found (404), showing empty state');
        setSummary(null);
      } else {
        toast.error('Failed to load budget');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('TripBudgetPage mounted, tripId:', tripId);
    fetchBudgetSummary();
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const handleSetBudget = async (totalPerPerson: number, currency: string) => {
    if (!tripId) return;

    try {
      await budgetApi.createOrUpdateBudget(tripId, { totalPerPerson, currency });
      toast.success('Budget set successfully!');
      await fetchBudgetSummary();
    } catch (error: any) {
      throw error;
    }
  };

  const handleAddExpense = async (description: string, cost: number, category: ExpenseCategory, activityId?: string) => {
    if (!tripId) return;

    try {
      await budgetApi.addExpense(tripId, { description, cost, category, activityId });
      toast.success('Expense added successfully!');
      
      await fetchBudgetSummary();
      await fetchActivities();
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Loading budget...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <>
        <EmptyBudgetState onSetBudget={() => setShowSetBudgetDialog(true)} />
        <SetBudgetDialog
          open={showSetBudgetDialog}
          onOpenChange={setShowSetBudgetDialog}
          onSubmit={handleSetBudget}
        />
      </>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <BudgetOverviewCards 
        summary={summary} 
        onEditBudget={() => setShowSetBudgetDialog(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetCategories 
            summary={summary} 
            onAddExpense={() => setShowAddExpenseDialog(true)}
          />
        </div>

        <BudgetSummaryChart summary={summary} />
      </div>

      <SetBudgetDialog
        open={showSetBudgetDialog}
        onOpenChange={setShowSetBudgetDialog}
        onSubmit={handleSetBudget}
        defaultCurrency={summary.currency}
        defaultTotalPerPerson={summary.totalPerPerson}
      />

      <AddExpenseDialog
        open={showAddExpenseDialog}
        activities={activities}
        onOpenChange={setShowAddExpenseDialog}
        onSubmit={handleAddExpense}
      />
    </div>
  );
}
