import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import PlaceInput, { type Place } from '@/pages/tripday/components/PlaceInput';
import type { LodgingFormData } from './AddLodgingDialog';

interface LodgingFormProps {
  formData: LodgingFormData;
  onFormDataChange: (data: LodgingFormData) => void;
  onPlaceSelect: (place: Place) => void;
  isSubmitting: boolean;
  error: string;
}

export function LodgingForm({
  formData,
  onFormDataChange,
  onPlaceSelect,
  isSubmitting,
  error,
}: LodgingFormProps) {
  const handlePlaceSelect = (place: Place): void => {
    onPlaceSelect(place);
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Lodging Name *</Label>
        <PlaceInput
          value={formData.name}
          onChange={(val) => onFormDataChange({ ...formData, name: val })}
          onPlaceSelect={handlePlaceSelect}
          includedTypes={['lodging', 'hotel']}
          placeholder="Search for a hotel, resort, or lodging..."
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          placeholder="Address will be auto-filled when you select a place"
          value={formData.address}
          onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkInDate">Check-In Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="checkInDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.checkInDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.checkInDate ? format(formData.checkInDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.checkInDate}
                onSelect={(date) => onFormDataChange({ ...formData, checkInDate: date })}
                initialFocus
                disabled={(date) =>
                  date < new Date() || (formData.checkOutDate ? date >= formData.checkOutDate : false)
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkOutDate">Check-Out Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="checkOutDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.checkOutDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.checkOutDate}
                onSelect={(date) => onFormDataChange({ ...formData, checkOutDate: date })}
                initialFocus
                disabled={(date) =>
                  date < new Date() || (formData.checkInDate ? date <= formData.checkInDate : false)
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
