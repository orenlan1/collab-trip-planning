import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ExpenseCategory } from '../types/budget';
import type { Activity } from '@/types/activity';
import { ExpenseForm, type ExpenseFormData } from './ExpenseForm';

interface AddExpenseDialogProps {
  open: boolean;
  activity?: Activity; // Single activity (from itinerary page)
  activities?: Activity[]; // List of activities (from budget page)
  onOpenChange: (open: boolean) => void;
  onSubmit: (description: string, cost: number, category: ExpenseCategory, activityId?: string) => Promise<void>;
}

export function AddExpenseDialog({ open, activity, activities, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: activity?.name || '',
    cost: '',
    category: 'FOOD',
    selectedActivityId: '',
  });
  const [linkToActivity, setLinkToActivity] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When activities list is provided (budget page mode), update description when activity is selected
  useEffect(() => {
    if (activities && linkToActivity && formData.selectedActivityId) {
      const selected = activities.find(a => a.id === formData.selectedActivityId);
      if (selected?.name) {
        setFormData(prev => ({ ...prev, description: selected.name || '' }));
      }
    }
  }, [formData.selectedActivityId, activities, linkToActivity]);

  const handleFormDataChange = (data: Partial<ExpenseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setIsSubmitting(true);
    try {
      // Use selectedActivityId if in activities mode, otherwise use activity?.id
      const activityId = activities ? (formData.selectedActivityId || undefined) : activity?.id;
      await onSubmit(formData.description, amount, formData.category, activityId);
      
      // Reset form
      setFormData({
        description: activity?.name || '',
        cost: '',
        category: 'FOOD',
        selectedActivityId: '',
      });
      setLinkToActivity(false);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setFormData({
      description: activity?.name || '',
      cost: '',
      category: 'FOOD',
      selectedActivityId: '',
    });
    setLinkToActivity(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ExpenseForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            activities={activities}
            linkToActivity={linkToActivity}
            onLinkToActivityChange={setLinkToActivity}
            showActivitySelector={!!activities && activities.length > 0}
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
              disabled={isSubmitting || (activities && linkToActivity && !formData.selectedActivityId)}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
