import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import PlaceInput from "./PlaceInput";
import type { Place } from "./PlaceInput";

interface CreateActivityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (placeName: string, address: string) => void;
}

const AddActivityDialog: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit
}) => {
  const [placeName, setPlaceName] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setPlaceName("");
      setSelectedPlace(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placeName.trim() && selectedPlace) {
      setIsSubmitting(true);
      try {
        await onSubmit(selectedPlace.name || placeName, selectedPlace.address || "");
      } catch (error) {
        console.error("Failed to create activity:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Activity & Tour</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="place-name">Place name *</Label>
              <PlaceInput
                value={placeName}
                onChange={setPlaceName}
                onPlaceSelect={setSelectedPlace}
                placeholder="Search for a place..."
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Select a place from the suggestions to auto-fill the address
              </p>
            </div>
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
              disabled={isSubmitting || !placeName.trim() || !selectedPlace}
            >
              {isSubmitting ? 'Adding...' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityDialog;
