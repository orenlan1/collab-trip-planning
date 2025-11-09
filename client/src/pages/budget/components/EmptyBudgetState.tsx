import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyBudgetStateProps {
  onSetBudget: () => void;
}

export function EmptyBudgetState({ onSetBudget }: EmptyBudgetStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-gray-100 rounded-full p-6 mb-6">
        <Wallet className="w-16 h-16 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No Budget Set</h2>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Set a budget for this trip to track expenses and manage spending across different categories.
      </p>
      <Button onClick={onSetBudget} size="lg">
        Set Trip Budget
      </Button>
    </div>
  );
}
