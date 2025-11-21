import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExpenseCategory } from '../types/budget';
import type { Activity } from '@/types/activity';

export interface ExpenseFormData {
  description: string;
  cost: string;
  category: ExpenseCategory;
  selectedActivityId?: string;
}

interface ExpenseFormProps {
  formData: ExpenseFormData;
  onFormDataChange: (data: Partial<ExpenseFormData>) => void;
  activities?: Activity[];
  linkToActivity?: boolean;
  onLinkToActivityChange?: (linked: boolean) => void;
  showActivitySelector?: boolean;
  error?: string;
}

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'ACTIVITIES', label: 'Activities & Tours' },
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export function ExpenseForm({
  formData,
  onFormDataChange,
  activities,
  linkToActivity = false,
  onLinkToActivityChange,
  showActivitySelector = false,
  error,
}: ExpenseFormProps) {
  const handleChange = (field: keyof ExpenseFormData, value: string) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <div className="space-y-4 py-4">
      {/* Activity selector (only shown when activities list is provided and showActivitySelector is true) */}
      {showActivitySelector && activities && activities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="linkToActivity"
              type="checkbox"
              checked={linkToActivity}
              onChange={(e) => onLinkToActivityChange?.(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="linkToActivity" className="mb-0">
              Link to a planned activity
            </Label>
          </div>

          <p className="text-xs text-gray-500">
            Check this to pick a planned activity and auto-fill the description. Leave unchecked to add a general expense not tied to an activity.
          </p>

          {linkToActivity && (
            <div>
              <Label htmlFor="activity">Select an activity</Label>
              <select
                id="activity"
                value={formData.selectedActivityId || ''}
                onChange={(e) => handleChange('selectedActivityId', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an activity...</option>
                {activities
                  .filter((a) => !a.expense) // Only show activities without expenses
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
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
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
          value={formData.cost}
          onChange={(e) => handleChange('cost', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
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
  );
}
