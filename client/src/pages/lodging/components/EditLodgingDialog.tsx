import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LodgingForm } from './LodgingForm';
import type { Lodging } from '@/pages/lodging/services/api';
import type { LodgingFormData } from './AddLodgingDialog';

interface EditLodgingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLodgingUpdated: (lodgingData: LodgingFormData) => Promise<void>;
  lodging: Lodging | null;
}

export function EditLodgingDialog({ open, onOpenChange, onLodgingUpdated, lodging }: EditLodgingDialogProps) {
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

  // Populate form when lodging changes
  useEffect(() => {
    if (lodging && open) {
      setName(lodging.name);
      setAddress(lodging.address);
      setCheckInDate(new Date(lodging.checkIn));
      setCheckOutDate(new Date(lodging.checkOut));
      setGuests(lodging.guests);
    }
  }, [lodging, open]);

  const handleDialogClose = () => {
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

      await onLodgingUpdated(lodgingData);
      handleDialogClose();
    } catch (error: any) {
      console.error('Failed to update lodging:', error);
      setError(error.response?.data?.error || 'Failed to update lodging. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lodging</DialogTitle>
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
              {isSubmitting ? 'Updating...' : 'Update Lodging'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
