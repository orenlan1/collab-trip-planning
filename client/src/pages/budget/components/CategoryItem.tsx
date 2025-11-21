import type { ExpenseCategory } from '../types/budget';
import { FaPlane } from "react-icons/fa";
import { FaBed } from "react-icons/fa";
import { PiForkKnifeFill } from "react-icons/pi";
import { FaCamera } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import type { ReactElement } from 'react';
import { formatCurrencyAmount } from '@/lib/currency';

interface CategoryItemProps {
  category: ExpenseCategory;
  spent: number;
  currency: string;
  totalSpent: number;
  numberOfMembers?: number;
}

const categoryConfig: Record<ExpenseCategory, { icon: ReactElement; name: string;
   description: string; color: string, bgIconColor: string }> = {
  ACCOMMODATION: {
    icon: <FaBed className={`w-5 h-5 text-blue-500`} />,
    name: 'Accommodation',
    description: 'Hotels, Airbnb, Hostels',
    color: 'bg-blue-500',
    bgIconColor: 'bg-blue-100',
  },
  TRANSPORTATION: {
    icon: <FaPlane className={`w-5 h-5 text-green-500`} />,
    name: 'Transportation',
    description: 'Flights, Ferries, Local Transport',
    color: 'bg-green-500',
    bgIconColor: 'bg-green-100',
  },
  FOOD: {
    icon: <PiForkKnifeFill className={`w-5 h-5 text-orange-500`} />,
    name: 'Food & Dining',
    description: 'Restaurants, Groceries, Drinks',
    color: 'bg-orange-500',
    bgIconColor: 'bg-orange-100',
  },
  ACTIVITIES: {
    icon: <FaCamera className={`w-5 h-5 text-purple-500`} />,
    name: 'Activities & Tours',
    description: 'Excursions, Museums, Entertainment',
    color: 'bg-purple-500',
    bgIconColor: 'bg-purple-100',
  },
  MISCELLANEOUS: {
    icon: <FaShoppingBag className={`w-5 h-5 text-pink-500`} />,
    name: 'Miscellaneous',
    description: 'Gifts, Souvenirs, Personal Items',
    color: 'bg-pink-500',
    bgIconColor: 'bg-pink-100',
  },
};

export function CategoryItem({ category, spent, currency, totalSpent, numberOfMembers }: CategoryItemProps) {
  const config = categoryConfig[category];
  const percentage = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${config.bgIconColor} rounded-lg`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Spent</div>
          <div className="font-medium text-lg">
            {formatCurrencyAmount(spent, currency)}
          </div>
          <div>
            {numberOfMembers && numberOfMembers > 0 && (
              <span className="text-xs text-gray-500">
                ({formatCurrencyAmount(spent / numberOfMembers, currency)} per person)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Percentage bar showing proportion of total spending */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{percentage.toFixed(1)}% of total spending</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${config.color} h-2 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
