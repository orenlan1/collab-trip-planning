import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { ExpenseCategory } from '../types/budget';
import type { Activity } from '@/types/activity';
import { useFetchCurrencies } from '../hooks/useFetchCurrencies';

export interface ExpenseFormData {
  description: string;
  cost: string;
  category: ExpenseCategory;
  currency: string;
  selectedActivityId?: string;
  date?: Date;
}

interface ExpenseFormProps {
  formData: ExpenseFormData;
  onFormDataChange: (data: Partial<ExpenseFormData>) => void;
  activities?: Activity[];
  linkToActivity?: boolean;
  onLinkToActivityChange?: (linked: boolean) => void;
  showActivitySelector?: boolean;
  showCurrencySelector?: boolean;
  showDatePicker?: boolean; // Control date picker visibility externally
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
  showCurrencySelector = false,
  showDatePicker,
  error,
}: ExpenseFormProps) {
  const { currencies, isLoading: isLoadingCurrencies } = useFetchCurrencies();

  const handleChange = (field: keyof ExpenseFormData, value: string | Date) => {
    onFormDataChange({ [field]: value });
  };

  // Show date picker based on prop, or calculate from linkToActivity state
  const shouldShowDatePicker = showDatePicker !== undefined 
    ? showDatePicker 
    : (!linkToActivity || !formData.selectedActivityId);

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

      {/* Date picker - only shown when not linked to activity */}
      {shouldShowDatePicker && (
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => handleChange('date', date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-gray-500">
            Select the date when this expense occurred.
          </p>
        </div>
      )}

      {/* Helper text for activity-linked expenses */}
      {linkToActivity && formData.selectedActivityId && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            The expense date will automatically match the activity's scheduled day.
          </p>
        </div>
      )}

      {showCurrencySelector && (
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          {isLoadingCurrencies ? (
            <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
              Loading currencies...
            </div>
          ) : (
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Select currency...</option>
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
