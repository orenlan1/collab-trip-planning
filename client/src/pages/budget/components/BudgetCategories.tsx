import { Plus } from 'lucide-react';
import type { BudgetSummary } from '../types/budget';
import { CategoryItem } from './CategoryItem';
import { Button } from '@/components/ui/button';

interface BudgetCategoriesProps {
  summary: BudgetSummary;
  onAddExpense: () => void;
}

const categoryOrder: Array<keyof Pick<BudgetSummary, 'ACCOMMODATION' | 'TRANSPORTATION' | 'FOOD' | 'ACTIVITIES' | 'MISCELLANEOUS'>> = [
  'ACCOMMODATION',
  'TRANSPORTATION',
  'FOOD',
  'ACTIVITIES',
  'MISCELLANEOUS',
];

export function BudgetCategories({ summary, onAddExpense }: BudgetCategoriesProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 md:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Spending by Category</h2>
          <Button onClick={onAddExpense} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {categoryOrder.map((category) => (
          <CategoryItem
            key={category}
            category={category}
            spent={summary[category]}
            currency={summary.currency}
            totalSpent={summary.totalSpent}
            numberOfMembers={summary.numberOfMembers}
          />
        ))}
      </div>
    </div>
  );
}
