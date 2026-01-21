import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CreateExpenseInput } from '../types/budget';
import type { Activity } from '@/types/activity';
import { ExpenseForm, type ExpenseFormData } from './ExpenseForm';
import { useTripStore } from '@/stores/tripStore';

interface AddExpenseDialogProps {
  open: boolean;
  activity?: Activity; // Single activity (from itinerary page)
  activities?: Activity[]; // List of activities (from budget page)
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateExpenseInput) => Promise<void>;
}

export function AddExpenseDialog({ open, activity, activities, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const tripMembers = useTripStore(state => state.members || []);
   
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: activity?.name || '',
    cost: '',
    category: 'FOOD',
    currency: '',
    selectedActivityId: '',
    selectedMemberIds: [],
    date: new Date(),
  });
  const [linkToActivity, setLinkToActivity] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update selectedMemberIds when trip members change or dialog opens
  useEffect(() => {
    if (tripMembers.length > 0 && open) {
      setFormData(prev => ({ 
        ...prev, 
        selectedMemberIds: tripMembers.map((m: typeof tripMembers[number]) => m.id || m.userId).filter(id => id)
      }));
    }
  }, [tripMembers, open]);

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

    if (!formData.currency.trim()) {
      setError('Please select a currency');
      return;
    }

    // Validate date for non-activity expenses
    const showDatePicker = !linkToActivity || !formData.selectedActivityId;
    if (showDatePicker && !formData.date) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use selectedActivityId if in activities mode, otherwise use activity?.id
      const activityId = activities ? (formData.selectedActivityId || undefined) : activity?.id;
      
      // Format date as YYYY-MM-DD in local time, only pass if not linked to activity
      let dateString: string | undefined;
      if (!activityId && formData.date) {
        const year = formData.date.getFullYear();
        const month = String(formData.date.getMonth() + 1).padStart(2, '0');
        const day = String(formData.date.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }
      await onSubmit({
        description: formData.description,
        cost: amount,
        category: formData.category,
        activityId,
        currency: formData.currency,
        date: dateString,
        splitMemberIds: formData.selectedMemberIds
      });
      
      // Reset form
      setFormData({
        description: activity?.name || '',
        cost: '',
        category: 'FOOD',
        currency: '',
        selectedActivityId: '',
        selectedMemberIds: tripMembers.map((m: typeof tripMembers[number]) => m.id || m.userId).filter(id => id),
        date: new Date(),
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
      currency: '',
      selectedActivityId: '',
      selectedMemberIds: tripMembers.map((m: typeof tripMembers[number]) => m.id || m.userId).filter(id => id),
      date: new Date(),
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
            tripMembers={tripMembers}
            linkToActivity={linkToActivity}
            onLinkToActivityChange={setLinkToActivity}
            showActivitySelector={!!activities && activities.length > 0}
            showCurrencySelector={true}
            showDatePicker={!activity}
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
