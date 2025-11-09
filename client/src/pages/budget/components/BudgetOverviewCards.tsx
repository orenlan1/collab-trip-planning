import type { BudgetSummary } from '../types/budget';

interface BudgetOverviewCardsProps {
  summary: BudgetSummary;
}

export function BudgetOverviewCards({ summary }: BudgetOverviewCardsProps) {
  const spentPercentage = (summary.totalSpent / summary.totalBudget) * 100;
  const remainingPercentage = (summary.remaining / summary.totalBudget) * 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Total Budget */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {summary.currency} {summary.totalBudget.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">Total Budget</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div className="bg-green-500 h-1 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>

      {/* Spent */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
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
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {summary.currency} {summary.totalSpent.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">Spent ({summary.currency} {summary.totalSpent / summary.numberOfMembers} per person)</div>
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
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
          </div>
          <span className={`text-sm font-medium ${
            summary.remaining < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {remainingPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {summary.currency} {summary.remaining.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          {summary.remaining < 0 ? 'Over Budget' : 'Remaining'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className={`h-1 rounded-full ${
              summary.remaining < 0 ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(Math.abs(remainingPercentage), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Per Person */}
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
          </div>
          <span className="text-gray-500 text-sm font-medium">
            {summary.numberOfMembers} {summary.numberOfMembers === 1 ? 'Person' : 'People'}
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">
          {summary.currency} {summary.totalPerPerson.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">Per Person</div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
          <div className="bg-purple-500 h-1 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
