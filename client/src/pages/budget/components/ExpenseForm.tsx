import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { ExpenseCategory } from '../types/budget';
import type { Activity } from '@/types/activity';
import type { TripMember } from '@/types/tripMember';
import { useFetchCurrencies } from '../hooks/useFetchCurrencies';
import { MemberSelector } from './MemberSelector';

export interface ExpenseFormData {
  description: string;
  cost: string;
  category: ExpenseCategory;
  currency: string;
  selectedActivityId?: string;
  selectedMemberIds: string[];
  date?: Date;
}

interface ExpenseFormProps {
  formData: ExpenseFormData;
  onFormDataChange: (data: Partial<ExpenseFormData>) => void;
  activities?: Activity[];
  tripMembers?: TripMember[];
  linkToActivity?: boolean;
  onLinkToActivityChange?: (linked: boolean) => void;
  showActivitySelector?: boolean;
  showCurrencySelector?: boolean;
  showDatePicker?: boolean;
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
  tripMembers,
  linkToActivity = false,
  onLinkToActivityChange,
  showActivitySelector = false,
  showCurrencySelector = false,
  showDatePicker,
  error,
}: ExpenseFormProps) {
  const { currencies, isLoading: isLoadingCurrencies } = useFetchCurrencies();

  const handleChange = (field: keyof ExpenseFormData, value: string | Date | string[]) => {
    onFormDataChange({ [field]: value });
  };

  // Show date picker based on prop, or calculate from linkToActivity state
  const shouldShowDatePicker = showDatePicker !== undefined 
    ? showDatePicker 
    : (!linkToActivity || !formData.selectedActivityId);

  const totalCost = parseFloat(formData.cost) || 0;

  return (
    <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
      {/* Activity selector (only shown when activities list is provided and showActivitySelector is true) */}
      {showActivitySelector && activities && activities.length > 0 && (
        <div className="space-y-1.5 ">
          <div className="flex items-center gap-2">
            <input
              id="linkToActivity"
              type="checkbox"
              checked={linkToActivity}
              onChange={(e) => onLinkToActivityChange?.(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="linkToActivity" className="mb-0 text-sm">
              Link to a planned activity
            </Label>
          </div>

          <p className="text-xs text-gray-500">
            Check this to pick a planned activity and auto-fill the description. Leave unchecked to add a general expense not tied to an activity.
          </p>

          {linkToActivity && (
            <div>
              <Label htmlFor="activity" className="text-sm">Select an activity</Label>
              <select
                id="activity"
                value={formData.selectedActivityId || ''}
                onChange={(e) => handleChange('selectedActivityId', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* Helper text for activity-linked expenses */}
      {linkToActivity && formData.selectedActivityId && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-2">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            The expense date will automatically match the activity's scheduled day.
          </p>
        </div>
      )}

      {/* Two-column grid layout */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label htmlFor="description" className="text-sm">Description</Label>
          <Input
            id="description"
            type="text"
            placeholder="Dinner at restaurant"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="h-9"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cost" className="text-sm">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            placeholder="45.50"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            className="h-9"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="category" className="text-sm">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="space-y-1">
            <Label htmlFor="date" className="text-sm">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-9"
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
          </div>
        )}

        {showCurrencySelector && (
          <div className="space-y-1">
            <Label htmlFor="currency" className="text-sm">Currency</Label>
            {isLoadingCurrencies ? (
              <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-sm text-muted-foreground">
                Loading currencies...
              </div>
            ) : (
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

        {tripMembers && tripMembers.length > 0 && (
          <div className="col-span-2">
            <MemberSelector
              members={tripMembers}
              selectedMemberIds={formData.selectedMemberIds}
              totalCost={totalCost}
              currency={formData.currency}
              onSelectionChange={(ids) => handleChange('selectedMemberIds', ids)}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
