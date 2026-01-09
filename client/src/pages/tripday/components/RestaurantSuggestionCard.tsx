import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { Restaurant } from '../services/api';

interface RestaurantSuggestionCardProps {
  restaurant: Restaurant;
  onSelect: () => void;
  isSelected: boolean;
}

const RestaurantSuggestionCard: React.FC<RestaurantSuggestionCardProps> = ({
  restaurant,
  onSelect,
  isSelected
}) => {

  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg transition duration-200 blur ${isSelected ? 'opacity-75' : 'opacity-0 group-hover:opacity-75'}`}></div>
      <div 
        onClick={onSelect}
        className="relative flex items-start gap-3 p-3 border rounded-lg bg-background hover:bg-accent/50 cursor-pointer transition-colors"
      >
        <Button
          type="button"
          size="sm"
          className={`absolute top-3 right-3 transition-all ${isSelected ? 'opacity-100 bg-green-600 hover:bg-green-700' : 'opacity-0 group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-700'} text-white`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Check className="w-4 h-4" />
          {!isSelected && <span className="ml-1">Select</span>}
        </Button>
        <div className="w-16 h-16 bg-muted rounded shrink-0 flex items-center justify-center text-2xl">
          🍽️
        </div>
        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium">{restaurant.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          <p className="text-xs text-muted-foreground mt-1">{restaurant.address}</p>
          <div className="mt-2 bg-primary/10 rounded p-2">
            <p className="text-xs">
              <span className="font-medium">Why:</span> {restaurant.whyRecommended}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSuggestionCard;
