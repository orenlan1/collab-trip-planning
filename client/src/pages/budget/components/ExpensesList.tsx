import { Button } from '@/components/ui/button';
import { formatCurrencyAmount } from '@/lib/currency';
import { format } from 'date-fns';
import type { Expense } from '@/types/expense';

interface ExpensesListProps {
  expenses: Expense[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

const categoryColors: Record<string, string> = {
  TRANSPORTATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACCOMMODATION: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ACTIVITIES: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  FOOD: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  MISCELLANEOUS: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const categoryLabels: Record<string, string> = {
  TRANSPORTATION: 'Transportation',
  ACCOMMODATION: 'Accommodation',
  ACTIVITIES: 'Activities',
  FOOD: 'Food',
  MISCELLANEOUS: 'Miscellaneous',
};

export function ExpensesList({ expenses, hasMore, isLoading, onLoadMore }: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Expenses</h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoryColors[expense.category] || categoryColors.MISCELLANEOUS
                  }`}>
                    {categoryLabels[expense.category] || expense.category}
                  </span>
                  {expense.activity?.name && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      • {expense.activity.name}
                    </span>
                  )}
                </div>
                
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {expense.description}
                </p>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="ml-4 flex-shrink-0 text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrencyAmount(expense.cost, expense.currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
