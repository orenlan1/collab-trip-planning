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
  createdAt?: string;
}

interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseId: string, description: string, cost: number, category: ExpenseCategory) => Promise<void>;
}

export function EditExpenseDialog({ open, expense, onOpenChange, onSubmit }: EditExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: expense?.description || '',
    cost: expense?.cost?.toString() || '',
    category: (expense?.category as ExpenseCategory) || 'FOOD',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    setIsSubmitting(true);
    try {
      await onSubmit(expense.id, formData.description, amount, formData.category);
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
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ExpenseForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
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
