import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LodgingForm } from './LodgingForm';

export interface LodgingFormData {
  name: string;
  address: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
}

interface AddLodgingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLodgingAdded: (lodgingData: LodgingFormData) => Promise<void>;
}

export function AddLodgingDialog({ open, onOpenChange, onLodgingAdded }: AddLodgingDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceSelect = (_place: { id: string; name: string; address: string }): void => {
    // Place data is already set via setName and setAddress in LodgingForm
    // This callback can be used for additional logic if needed
  };

  const handleDialogClose = (): void => {
    onOpenChange(false);
    // Reset form
    setName('');
    setAddress('');
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setGuests(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !address || !checkInDate || !checkOutDate || !guests) {
      setError('All fields are required');
      return;
    }

    if (checkInDate >= checkOutDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    try {
      setIsSubmitting(true);

      const lodgingData: LodgingFormData = {
        name,
        address,
        checkInDate,
        checkOutDate,
        guests,
      };

      await onLodgingAdded(lodgingData);
      handleDialogClose();
    } catch (error: any) {
      console.error('Failed to add lodging:', error);
      setError(error.response?.data?.error || 'Failed to add lodging. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Lodging</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <LodgingForm
            name={name}
            setName={setName}
            address={address}
            setAddress={setAddress}
            onPlaceSelect={handlePlaceSelect}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
            checkOutDate={checkOutDate}
            setCheckOutDate={setCheckOutDate}
            guests={guests}
            setGuests={setGuests}
            isSubmitting={isSubmitting}
            error={error}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Lodging'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
