import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CreateExpenseInput, ExpenseCategory } from '../types/budget';
import type { Expense } from '@/types/expense';
import { ExpenseForm, type ExpenseFormData } from './ExpenseForm';
import { useTripStore } from '@/stores/tripStore';

interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (expenseId: string, input: CreateExpenseInput) => Promise<void>;
}

export function EditExpenseDialog({ open, expense, onOpenChange, onSubmit }: EditExpenseDialogProps) {
  const tripMembers = useTripStore(state => state.members || []);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    cost: '',
    category: 'FOOD',
    currency: '',
    selectedActivityId: '',
    selectedMemberIds: [],
    date: new Date(),
    splitMode: 'equal',
    customSplitAmounts: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      const defaultMemberIds = tripMembers.map(m => m.id || m.userId).filter(id => id);
      const splits = expense.splits ?? [];
      const memberIds = splits.length > 0 ? splits.map(s => s.memberId) : defaultMemberIds;

      // Detect unequal split: any share differs from the first
      const isCustom = splits.length > 1 &&
        splits.some(s => Math.abs(s.share - splits[0].share) > 0.01);

      const customSplitAmounts = isCustom
        ? Object.fromEntries(splits.map(s => [s.memberId, s.share.toString()]))
        : {};

      setFormData({
        description: expense.description,
        cost: expense.cost.toString(),
        category: expense.category as ExpenseCategory,
        currency: expense.currency,
        selectedActivityId: expense.activityId || '',
        selectedMemberIds: memberIds,
        date: new Date(expense.date),
        splitMode: isCustom ? 'custom' : 'equal',
        customSplitAmounts,
      });
      setError('');
    }
  }, [expense, tripMembers]);

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
 
    if (formData.splitMode === 'custom') {
      const customTotal = formData.selectedMemberIds.reduce((sum, id) => {
        return sum + (parseFloat(formData.customSplitAmounts[id] || '0') || 0);
      }, 0);
      if (Math.abs(customTotal - amount) > 0.01) {
        setError(`Custom split amounts must sum to the total cost (${amount.toFixed(2)}). Current sum: ${customTotal.toFixed(2)}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const year = formData.date.getFullYear();
      const month = String(formData.date.getMonth() + 1).padStart(2, '0');
      const day = String(formData.date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const splitAmounts = formData.splitMode === 'custom'
        ? formData.selectedMemberIds.map(memberId => ({
            memberId,
            amount: parseFloat(formData.customSplitAmounts[memberId] || '0'),
          }))
        : undefined;

      await onSubmit(expense.id, {
        description: formData.description,
        cost: amount,
        category: formData.category,
        currency: formData.currency,
        date: dateString,
        splitMemberIds: formData.splitMode === 'equal' ? formData.selectedMemberIds : undefined,
        splitAmounts,
      });
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.error ?? 'Failed to update expense') : 'Failed to update expense');
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
            tripMembers={tripMembers}
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
