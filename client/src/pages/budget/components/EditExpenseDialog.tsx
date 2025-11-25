import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ExpenseCategory } from '../types/budget';
import { ExpenseForm, type ExpenseFormData } from './ExpenseForm';

export interface Expense {
  id: string;
  description?: string | null;
  cost: number;
  category?: string | null;
  currency?: string | null;
  date?: string;
  activityId?: string | null;
  createdAt?: string;
}

interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseId: string, description: string, cost: number, category: ExpenseCategory, currency: string, date?: string) => Promise<void>;
}

export function EditExpenseDialog({ open, expense, onOpenChange, onSubmit }: EditExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense?.description || '',
    cost: expense?.cost?.toString() || '',
    category: (expense?.category as ExpenseCategory) || 'FOOD',
    currency: expense?.currency || '',
    date: expense?.date ? new Date(expense.date) : new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isLinkedToActivity = !!expense?.activityId;

  const handleFormDataChange = (data: Partial<ExpenseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!expense) {
      setError('No expense selected');
      return;
    }

    const amount = parseFloat(formData.cost);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid cost');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!formData.currency.trim()) {
      setError('Please select a currency');
      return;
    }

    // Validate date for non-activity expenses
    if (!isLinkedToActivity && !formData.date) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      // Only pass date if expense is not linked to activity, format in local time
      let dateString: string | undefined;
      if (!isLinkedToActivity && formData.date) {
        const year = formData.date.getFullYear();
        const month = String(formData.date.getMonth() + 1).padStart(2, '0');
        const day = String(formData.date.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }
      
      await onSubmit(expense.id, formData.description, amount, formData.category, formData.currency, dateString);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    // Reset form to expense data
    if (expense) {
      setFormData({
        description: expense.description || '',
        cost: expense.cost?.toString() || '',
        category: (expense.category as ExpenseCategory) || 'FOOD',
        currency: expense.currency || '',
        date: expense.date ? new Date(expense.date) : new Date(),
      });
    }
    setError('');
  };

  // Update form when expense changes
  if (open && expense && formData.description !== (expense.description || '')) {
    setFormData({
      description: expense.description || '',
      cost: expense.cost?.toString() || '',
      category: (expense.category as ExpenseCategory) || 'FOOD',
      currency: expense.currency || '',
      date: expense.date ? new Date(expense.date) : new Date(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {isLinkedToActivity && (
            <div className="mb-4 rounded-md bg-blue-50 dark:bg-blue-950 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This expense is linked to an activity. The date cannot be changed and is automatically set to the activity's scheduled day.
              </p>
            </div>
          )}
          <ExpenseForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            showCurrencySelector={true}
            linkToActivity={isLinkedToActivity}
            showDatePicker={!isLinkedToActivity} // Hide date picker for activity-linked expenses
            error={error}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
