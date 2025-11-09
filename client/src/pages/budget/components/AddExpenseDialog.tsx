import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExpenseCategory } from '../types/budget';
import type { Activity } from '@/types/activity';

interface Expense {
  id: string;
  description?: string | null;
  cost: number;
  category?: string | null;
  createdAt?: string;
}

interface AddExpenseDialogProps {
  open: boolean;
  activity?: Activity; // Single activity (from itinerary page)
  activities?: Activity[]; // List of activities (from budget page)
  expense?: Expense; // Existing expense for editing
  onOpenChange: (open: boolean) => void;
  onSubmit: (description: string, cost: number, category: ExpenseCategory, activityId?: string, expenseId?: string) => Promise<void>;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'ACTIVITIES', label: 'Activities & Tours' },
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export function AddExpenseDialog({ open, activity, activities, expense, onOpenChange, onSubmit }: AddExpenseDialogProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [description, setDescription] = useState(expense?.description || activity?.name || '');
  const [cost, setCost] = useState(expense?.cost?.toString() || '');
  const [category, setCategory] = useState<ExpenseCategory>((expense?.category as ExpenseCategory) || 'FOOD');
  const [linkToActivity, setLinkToActivity] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!expense;

  // When activities list is provided (budget page mode), update description when activity is selected
  useEffect(() => {
    if (activities && linkToActivity && selectedActivityId) {
      const selected = activities.find(a => a.id === selectedActivityId);
      if (selected?.name) {
        setDescription(selected.name);
      }
    }
  }, [selectedActivityId, activities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(cost);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid cost');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use selectedActivityId if in activities mode, otherwise use activity?.id
      const activityId = activities ? (selectedActivityId || undefined) : activity?.id;
      await onSubmit(description, amount, category, activityId, expense?.id);
      
      // Reset form
      setDescription('');
      setCost('');
      setCategory('FOOD');
      setSelectedActivityId('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'add'} expense`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    setDescription(expense?.description || activity?.name || '');
    setCost(expense?.cost?.toString() || '');
    setCategory((expense?.category as ExpenseCategory) || 'FOOD');
    setSelectedActivityId('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Activity selector (only shown when activities list is provided - budget page mode and not editing) */}
            {activities && activities.length > 0 && !isEditing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="linkToActivity"
                    type="checkbox"
                    checked={linkToActivity}
                    onChange={(e) => setLinkToActivity(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="linkToActivity" className="mb-0">Link to a planned activity</Label>
                </div>

                <p className="text-xs text-gray-500">Check this to pick a planned activity and auto-fill the description. Leave unchecked to add a general expense not tied to an activity.</p>

                {linkToActivity && (
                  <div>
                    <Label htmlFor="activity">Select an activity</Label>
                    <select
                      id="activity"
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select an activity...</option>
                      {activities
                        .filter(a => !a.expense) // Only show activities without expenses
                        .map((act) => (
                          <option key={act.id} value={act.id}>
                            {act.name || 'Unnamed activity'}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="45.50"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
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
              disabled={isSubmitting || (activities && linkToActivity && !selectedActivityId)}
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Expense' : 'Add Expense')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
