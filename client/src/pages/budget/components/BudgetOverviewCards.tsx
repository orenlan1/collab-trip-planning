import type { BudgetSummary } from '../types/budget';
import { formatCurrencyAmount } from '@/lib/currency';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BudgetOverviewCardsProps {
  summary: BudgetSummary;
  onEditBudget?: () => void;
}

export function BudgetOverviewCards({ summary, onEditBudget }: BudgetOverviewCardsProps) {
  const isBudgetSet = summary.totalPerPerson !== null;
  const spentPercentage = isBudgetSet && summary.totalBudget > 0 
    ? (summary.totalSpent / summary.totalBudget) * 100 
    : 0;
  const remainingPercentage = isBudgetSet && summary.totalBudget > 0
    ? (summary.remaining / summary.totalBudget) * 100 
    : 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
        {onEditBudget && (
          <Button onClick={onEditBudget} variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            {isBudgetSet ? 'Edit Budget' : 'Set Budget'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Total Budget */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrencyAmount(summary.totalBudget, summary.currency)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300">Total Budget</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div className="bg-green-500 h-1 rounded-full" style={{ width: isBudgetSet ? '100%' : '0%' }}></div>
        </div>
      </div>

      {/* Spent */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
          </div>
          <span className={`text-sm font-medium ${
            spentPercentage > 80 ? 'text-red-500' : 'text-blue-500'
          }`}>
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrencyAmount(summary.totalSpent, summary.currency)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300">
          Spent ({formatCurrencyAmount(summary.totalSpent / summary.numberOfMembers, summary.currency)} per person)
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className={`h-1 rounded-full ${
              spentPercentage > 80 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Remaining */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
          </div>
          <span className={`text-sm font-medium ${
            isBudgetSet && summary.remaining < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {remainingPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrencyAmount(summary.remaining, summary.currency)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300">
          {isBudgetSet && summary.remaining < 0 ? 'Over Budget' : 'Remaining'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className={`h-1 rounded-full ${
              isBudgetSet && summary.remaining < 0 ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(Math.abs(remainingPercentage), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Per Person */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
          </div>
          <span className="text-gray-500 dark:text-gray-300 text-sm font-medium">
            {summary.numberOfMembers} {summary.numberOfMembers === 1 ? 'Person' : 'People'}
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {formatCurrencyAmount(isBudgetSet ? summary.totalPerPerson! : 0, summary.currency)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-300">Per Person</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div className="bg-purple-500 h-1 rounded-full" style={{ width: isBudgetSet ? '100%' : '0%' }}></div>
        </div>
      </div>
    </div>
    </div>
  );
}
