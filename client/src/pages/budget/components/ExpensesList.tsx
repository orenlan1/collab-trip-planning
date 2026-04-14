import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatCurrencyAmount } from '@/lib/currency';
import { format } from 'date-fns';
import { FaTrash, FaEdit } from "react-icons/fa";
import type { Expense } from '@/types/expense';

interface ExpensesListProps {
  expenses: Expense[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
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

export function ExpensesList({ expenses, hasMore, isLoading, onLoadMore, onEdit, onDelete }: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6 text-center">
        <p className="text-muted-foreground">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border/60">
      <div className="p-6 border-b border-border/60">
        <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
      </div>

      <div className="divide-y divide-border/50">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 hover:bg-secondary/40 transition-colors duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoryColors[expense.category] || categoryColors.MISCELLANEOUS
                  }`}>
                    {categoryLabels[expense.category] || expense.category}
                  </span>
                  {expense.activity?.name && (
                    <span className="text-xs text-muted-foreground truncate">
                      • {expense.activity.name}
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-foreground truncate">
                  {expense.description}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(expense.date), 'MMM d, yyyy')}
                  </p>

                  {expense.splits && expense.splits.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex -space-x-2">
                        {expense.splits.slice(0, 3).map((split) => (
                          <Avatar
                            key={split.id}
                            className="h-5 w-5 border-2 border-card"
                            src={split.member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(split.member.user.name!)}`}
                            alt={split.member.user.name || ''}
                            fallback={split.member.user.name?.charAt(0).toUpperCase() || 'U'}
                          />
                        ))}
                        {expense.splits.length > 3 && (
                          <div className="h-5 w-5 rounded-full bg-secondary border-2 border-card flex items-center justify-center">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              +{expense.splits.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {formatCurrencyAmount(expense.cost, expense.currency)}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} className="h-8 w-8">
                    <FaEdit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(expense)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <FaTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="p-4 border-t border-border/60">
          <Button onClick={onLoadMore} disabled={isLoading} variant="outline" className="w-full">
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
