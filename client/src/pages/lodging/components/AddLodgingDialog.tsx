import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LodgingForm } from './LodgingForm';
import type { Place } from '@/pages/tripday/components/PlaceInput';

export interface LodgingFormData {
  name: string;
  address: string;
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  latitude?: number;
  longitude?: number;
}

interface AddLodgingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLodgingAdded: (lodgingData: LodgingFormData) => Promise<void>;
}

export function AddLodgingDialog({ open, onOpenChange, onLodgingAdded }: AddLodgingDialogProps) {
  const [formData, setFormData] = useState<LodgingFormData>({
    name: '',
    address: '',
    checkInDate: undefined,
    checkOutDate: undefined,
    latitude: undefined,
    longitude: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceSelect = (place: Place): void => {
    setFormData(prev => ({
      ...prev,
      name: place.name,
      address: place.address,
      latitude: place.location?.lat,
      longitude: place.location?.lng
    }));
  };

  const handleDialogClose = (): void => {
    onOpenChange(false);
    setFormData({
      name: '',
      address: '',
      checkInDate: undefined,
      checkOutDate: undefined,
      latitude: undefined,
      longitude: undefined
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.address || !formData.checkInDate || !formData.checkOutDate) {
      setError('All fields are required');
      return;
    }

    if (formData.checkInDate >= formData.checkOutDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLodgingAdded(formData);
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
            formData={formData}
            onFormDataChange={setFormData}
            onPlaceSelect={handlePlaceSelect}
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
