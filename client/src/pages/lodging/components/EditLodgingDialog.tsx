import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LodgingForm } from './LodgingForm';
import type { Lodging } from '@/pages/lodging/services/api';
import type { LodgingFormData } from './AddLodgingDialog';
import type { Place } from '@/pages/tripday/components/PlaceInput';

interface EditLodgingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLodgingUpdated: (lodgingData: LodgingFormData) => Promise<void>;
  lodging: Lodging | null;
}

export function EditLodgingDialog({ open, onOpenChange, onLodgingUpdated, lodging }: EditLodgingDialogProps) {
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

  useEffect(() => {
    if (lodging) {
      setFormData({
        name: lodging.name,
        address: lodging.address,
        checkInDate: new Date(lodging.checkIn),
        checkOutDate: new Date(lodging.checkOut),
        latitude: lodging.latitude,
        longitude: lodging.longitude
      });
      setError('');
    }
  }, [lodging]);

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
      await onLodgingUpdated(formData);
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
              {isSubmitting ? 'Updating...' : 'Update Lodging'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
