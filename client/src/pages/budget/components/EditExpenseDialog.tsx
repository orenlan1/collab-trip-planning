import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ExpenseCategory } from '../types/budget';
import type { Expense } from '@/types/expense';
import { ExpenseForm, type ExpenseFormData } from './ExpenseForm';

interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseId: string, description: string, cost: number, category: ExpenseCategory, currency?: string, date?: string) => Promise<void>;
}

export function EditExpenseDialog({ open, expense, onOpenChange, onSubmit }: EditExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    cost: '',
    category: 'FOOD',
    currency: '',
    selectedActivityId: '',
    date: new Date(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        cost: expense.cost.toString(),
        category: expense.category as ExpenseCategory,
        currency: expense.currency,
        selectedActivityId: expense.activityId || '',
        date: new Date(expense.date),
      });
      setError('');
    }
  }, [expense]);

  const handleFormDataChange = (data: Partial<ExpenseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || isSubmitting) return;
    
    setError('');

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

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const year = formData.date.getFullYear();
      const month = String(formData.date.getMonth() + 1).padStart(2, '0');
      const day = String(formData.date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      await onSubmit(expense.id, formData.description, amount, formData.category, formData.currency, dateString);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setError('');
    }
    onOpenChange(open);
  };

  const isLinkedToActivity = !!expense?.activityId;

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
                This expense is linked to the activity: <span className="font-semibold">{expense?.activity?.name}</span>
              </p>
            </div>
          )}
          <ExpenseForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            linkToActivity={false}
            showActivitySelector={false}
            showCurrencySelector={true}
            showDatePicker={true}
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
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
