import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import PlaceInput, { type Place } from '@/pages/tripday/components/PlaceInput';

interface LodgingFormProps {
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  onPlaceSelect: (place: Place) => void;
  checkInDate: Date | undefined;
  setCheckInDate: (date: Date | undefined) => void;
  checkOutDate: Date | undefined;
  setCheckOutDate: (date: Date | undefined) => void;
  guests: number;
  setGuests: (value: number) => void;
  isSubmitting: boolean;
  error: string;
}

export function LodgingForm({
  name,
  setName,
  address,
  setAddress,
  onPlaceSelect,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guests,
  setGuests,
  isSubmitting,
  error,
}: LodgingFormProps) {
  const handlePlaceSelect = (place: Place): void => {
    setName(place.name);
    setAddress(place.address);
    onPlaceSelect(place);
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Name - Using PlaceInput with lodging filter */}
      <div className="space-y-2">
        <Label htmlFor="name">Lodging Name *</Label>
        <PlaceInput
          value={name}
          onChange={setName}
          onPlaceSelect={handlePlaceSelect}
          // Lodging-specific types - if no results appear, try removing includedTypes temporarily
          includedTypes={['lodging', 'hotel']}
          placeholder="Search for a hotel, resort, or lodging..."
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Address - Read-only, auto-filled from place selection */}
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          placeholder="Address will be auto-filled when you select a place"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Date Pickers - Check In and Check Out */}
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
                  !checkInDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? format(checkInDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                initialFocus
                disabled={(date) =>
                  date < new Date() || (checkOutDate ? date >= checkOutDate : false)
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
                  !checkOutDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? format(checkOutDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                initialFocus
                disabled={(date) =>
                  date < new Date() || (checkInDate ? date <= checkInDate : false)
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Guests */}
      <div className="space-y-2">
        <Label htmlFor="guests">Number of Guests *</Label>
        <Input
          id="guests"
          type="number"
          min="1"
          placeholder="e.g., 2"
          value={guests || ''}
          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
