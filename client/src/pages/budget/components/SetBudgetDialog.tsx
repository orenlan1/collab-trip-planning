import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFetchCurrencies } from '../hooks/useFetchCurrencies';

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (totalPerPerson: number, currency: string) => Promise<void>;
  defaultCurrency?: string;
  defaultTotalPerPerson?: number;
}

export function SetBudgetDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  defaultCurrency = 'USD',
  defaultTotalPerPerson
}: SetBudgetDialogProps) {
  const [totalPerPerson, setTotalPerPerson] = useState(defaultTotalPerPerson?.toString() || '');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { currencies, isLoading: isLoadingCurrencies } = useFetchCurrencies();

  // Update form when defaults change
  useEffect(() => {
    if (open) {
      setTotalPerPerson(defaultTotalPerPerson?.toString() || '');
      setCurrency(defaultCurrency);
    }
  }, [open, defaultTotalPerPerson, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(totalPerPerson);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount, currency);
      setTotalPerPerson('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Trip Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="totalPerPerson">Budget Per Person</Label>
              <Input
                id="totalPerPerson"
                type="number"
                step="0.01"
                placeholder="1000"
                value={totalPerPerson}
                onChange={(e) => setTotalPerPerson(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              {isLoadingCurrencies ? (
                <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  Loading currencies...
                </div>
              ) : (
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                >
                  {currencies.length === 0 ? (
                    <option value="USD">USD - United States Dollar</option>
                  ) : (
                    currencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Setting...' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
