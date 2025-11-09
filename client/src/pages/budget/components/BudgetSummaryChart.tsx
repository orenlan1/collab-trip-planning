import type { BudgetSummary } from '../types/budget';

interface BudgetSummaryChartProps {
  summary: BudgetSummary;
}

const categoryConfig = {
  ACCOMMODATION: { name: 'Accommodation', color: '#3b82f6' },
  TRANSPORTATION: { name: 'Transportation', color: '#10b981' },
  FOOD: { name: 'Food & Dining', color: '#f59e0b' },
  ACTIVITIES: { name: 'Activities', color: '#8b5cf6' },
  MISCELLANEOUS: { name: 'Miscellaneous', color: '#ec4899' },
};

export function BudgetSummaryChart({ summary }: BudgetSummaryChartProps) {
  const categories = [
    { key: 'ACCOMMODATION', value: summary.ACCOMMODATION },
    { key: 'TRANSPORTATION', value: summary.TRANSPORTATION },
    { key: 'FOOD', value: summary.FOOD },
    { key: 'ACTIVITIES', value: summary.ACTIVITIES },
    { key: 'MISCELLANEOUS', value: summary.MISCELLANEOUS },
  ] as const;

  const totalSpent = summary.totalSpent;
  
  // Calculate percentages
  const categoriesWithPercentage = categories.map(cat => ({
    ...cat,
    percentage: totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0,
  }));

  // Calculate stroke dash array for donut chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = categoriesWithPercentage.map(cat => {
    const dashLength = (cat.percentage / 100) * circumference;
    const segment = {
      ...cat,
      dashArray: `${dashLength} ${circumference}`,
      dashOffset: -currentOffset,
    };
    currentOffset += dashLength;
    return segment;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Distribution</h3>
        
        {totalSpent > 0 ? (
          <>
            {/* Donut Chart */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#f3f4f6"
                  strokeWidth="10"
                  fill="transparent"
                />
                {segments.map((segment, index) => {
                  const config = categoryConfig[segment.key];
                  return segment.value > 0 ? (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={config.color}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                    />
                  ) : null;
                })}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-lg font-bold">
                    {summary.currency} {totalSpent.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {categoriesWithPercentage.map((cat) => {
                const config = categoryConfig[cat.key];
                return cat.value > 0 ? (
                  <div key={cat.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{config.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
