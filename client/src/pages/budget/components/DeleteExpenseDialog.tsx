import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Expense } from '@/types/expense';

interface DeleteExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (expenseId: string) => Promise<void>;
}

export function DeleteExpenseDialog({ open, expense, onOpenChange, onConfirm }: DeleteExpenseDialogProps) {
  const handleConfirm = async () => {
    if (!expense) return;
    await onConfirm(expense.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the expense "{expense?.description}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
