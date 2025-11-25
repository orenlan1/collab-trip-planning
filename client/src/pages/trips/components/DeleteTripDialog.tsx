import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteTripDialogProps {
  open: boolean;
  tripTitle: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTripDialog({
  open,
  tripTitle,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteTripDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Trip</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{tripTitle}"</span>?
            This action cannot be undone and will permanently delete all associated data including itineraries, activities, flights, and expenses.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
