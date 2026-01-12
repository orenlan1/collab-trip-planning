import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteFlightDialogProps {
  open: boolean;
  flightInfo: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteFlightDialog({
  open,
  flightInfo,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteFlightDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Flight</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the flight <span className="font-semibold text-gray-900 dark:text-white">{flightInfo}</span>?
            This action cannot be undone and will permanently delete the flight and any associated expense.
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
            {isDeleting ? 'Deleting...' : 'Delete Flight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
