import type { BudgetSummary } from '../types/budget';
import { formatCurrencyAmount } from '@/lib/currency';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaWallet } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa6";
import { FaPiggyBank } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { FaUser } from "react-icons/fa";

interface BudgetOverviewCardsProps {
  summary: BudgetSummary;
  userSpending?: { userSpending: number; currency: string } | null;
  onEditBudget?: () => void;
}

export function BudgetOverviewCards({ summary, userSpending, onEditBudget }: BudgetOverviewCardsProps) {
  const isBudgetSet = summary.totalPerPerson !== null;
  const spentPercentage = isBudgetSet && summary.totalBudget > 0
    ? (summary.totalSpent / summary.totalBudget) * 100
    : 0;
  const remainingPercentage = isBudgetSet && summary.totalBudget > 0
    ? (summary.remaining / summary.totalBudget) * 100
    : 0;

  const userFairShare = isBudgetSet && summary.numberOfMembers > 0
    ? summary.totalBudget / summary.numberOfMembers
    : 0;
  const userSpendingPercentage = userSpending && userFairShare > 0
    ? (userSpending.userSpending / userFairShare) * 100
    : 0;
  const isUserOverBudget = userSpending && userFairShare > 0 && userSpending.userSpending > userFairShare;

  return (
    <div className="space-y-4 mb-8">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Budget Overview</h2>
        {onEditBudget && (
          <Button onClick={onEditBudget} variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" />
            {isBudgetSet ? 'Edit Budget' : 'Set Budget'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Budget */}
        <div className="bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-500/20 dark:to-green-500/10 rounded-xl p-4 md:p-6 shadow-sm border border-emerald-200 dark:border-emerald-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <FaWallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
            {formatCurrencyAmount(summary.totalBudget, summary.currency)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Budget</div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-full h-2 mt-3">
            <div className="bg-linear-to-r from-emerald-500 to-green-400 h-2 rounded-full" style={{ width: isBudgetSet ? '100%' : '0%' }} />
          </div>
        </div>

        {/* Spent */}
        <div className="bg-linear-to-br from-blue-50 to-sky-50 dark:from-blue-500/20 dark:to-sky-500/10 rounded-xl p-4 md:p-6 shadow-sm border border-blue-200 dark:border-blue-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <FaCreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`text-sm font-semibold tabular-nums ${spentPercentage > 80 ? 'text-red-500' : 'text-blue-500'}`}>
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
            {formatCurrencyAmount(summary.totalSpent, summary.currency)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Spent</div>
          <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${spentPercentage > 80 ? 'bg-linear-to-r from-red-500 to-orange-400' : 'bg-linear-to-r from-blue-500 to-sky-400'}`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/10 rounded-xl p-4 md:p-6 shadow-sm border border-amber-200 dark:border-amber-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <FaPiggyBank className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className={`text-sm font-semibold tabular-nums ${isBudgetSet && summary.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {remainingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
            {formatCurrencyAmount(summary.remaining, summary.currency)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {isBudgetSet && summary.remaining < 0 ? 'Over Budget' : 'Remaining'}
          </div>
          <div className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${isBudgetSet && summary.remaining < 0 ? 'bg-linear-to-r from-red-500 to-orange-400' : 'bg-linear-to-r from-amber-500 to-orange-400'}`}
              style={{ width: `${Math.min(Math.abs(remainingPercentage), 100)}%` }}
            />
          </div>
        </div>

        {/* Per Person */}
        <div className="bg-linear-to-br from-violet-50 to-purple-50 dark:from-violet-500/20 dark:to-purple-500/10 rounded-xl p-4 md:p-6 shadow-sm border border-violet-200 dark:border-violet-800/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
              <GoGraph className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">
              {summary.numberOfMembers} {summary.numberOfMembers === 1 ? 'Person' : 'People'}
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
            {formatCurrencyAmount(isBudgetSet ? summary.totalPerPerson! : 0, summary.currency)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Per Person</div>
          <div className="w-full bg-violet-200 dark:bg-violet-900/40 rounded-full h-2 mt-3">
            <div className="bg-linear-to-r from-violet-500 to-purple-400 h-2 rounded-full" style={{ width: isBudgetSet ? '100%' : '0%' }} />
          </div>
        </div>

        {/* My Spending */}
        {userSpending && (
          <div className={`rounded-xl p-4 md:p-6 shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
            isUserOverBudget
              ? 'bg-linear-to-br from-red-50 to-orange-50 dark:from-red-500/20 dark:to-orange-500/10 border-red-200 dark:border-red-800/40'
              : 'bg-linear-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/20 dark:to-fuchsia-500/10 border-violet-200 dark:border-violet-800/40'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${isUserOverBudget ? 'bg-red-100 dark:bg-red-900/40' : 'bg-violet-100 dark:bg-violet-900/40'}`}>
                <FaUser className={`w-4 h-4 ${isUserOverBudget ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'}`} />
              </div>
              <span className={`text-sm font-semibold tabular-nums ${isUserOverBudget ? 'text-red-500' : 'text-violet-500'}`}>
                {userSpendingPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-bold tabular-nums text-foreground">
              {formatCurrencyAmount(userSpending.userSpending, userSpending.currency)}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {isUserOverBudget ? 'Over Your Share' : 'My Spending'}
            </div>
            <div className={`w-full rounded-full h-2 mt-3 ${isUserOverBudget ? 'bg-red-200/60 dark:bg-red-900/40' : 'bg-violet-200/60 dark:bg-violet-900/40'}`}>
              <div
                className={`h-2 rounded-full ${isUserOverBudget ? 'bg-linear-to-r from-red-500 to-orange-400' : 'bg-linear-to-r from-violet-500 to-fuchsia-400'}`}
                style={{ width: `${Math.min(userSpendingPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
