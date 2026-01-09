import { Input } from '@/components/ui/input';
import React, { useState } from "react";
import { diningApi, type Restaurant } from '../services/api';
import { FaWandMagic } from "react-icons/fa6";
import RestaurantSuggestionCard from './RestaurantSuggestionCard';
import type { CreateActivityRequest } from '@/types/activity';

interface AIDiningSearchProps {
  customInput: string;
  onCustomInputChange: (value: string) => void;
  onDiningSelect: (dining: CreateActivityRequest) => void;
  tripId: string;
  destination: string;
  disabled?: boolean;
}

const AIDiningSearch: React.FC<AIDiningSearchProps> = ({
  customInput,
  onCustomInputChange,
  onDiningSelect,
  tripId,
  destination,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const querySuggestions = [
    { emoji: "🍷", label: "Romantic w/ View", query: "romantic dinner with a view", className: "bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-100 dark:hover:bg-pink-200" },
    { emoji: "💰", label: "Cheap Eats", query: "cheap eats under €15", className: "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-100 dark:hover:bg-green-200" },
    { emoji: "🌾", label: "Gluten Free", query: "gluten free options", className: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-100 dark:hover:bg-blue-200" },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await diningApi.getDiningSuggestions(tripId, query, destination);
      setRestaurants(response.data.restaurants);
    } catch (err) {
      console.error('Failed to fetch dining suggestions:', err);
      setError('Failed to fetch suggestions. Please try again.');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionQuery: string) => {
    onCustomInputChange(suggestionQuery);
    handleSearch(suggestionQuery);
  };

  const handleInputSearch = () => {
    handleSearch(customInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSearch();
    }
  };

  const handleRestaurantClick = (restaurant: Restaurant, index: number) => {
    setSelectedIndex(index);
    onDiningSelect({
      name: restaurant.name,
      address: restaurant.address,
      latitude: restaurant.location.latitude,
      longitude: restaurant.location.longitude,
      description: restaurant.description + `\nRecommended because: ${restaurant.whyRecommended}`,
    });
  };

  return (
    <div className="space-y-4 py-4 px-1">
      <div className="space-y-2 ">
        <label className='text-sm font-medium text-indigo-500 dark:text-indigo-200' htmlFor="ai-query">What are you craving?</label>
        <div className="relative group mt-1">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-100 transition duration-200 blur"></div>
          <div className="relative flex items-center bg-background rounded-xl overflow-hidden">
            <FaWandMagic className="absolute left-3 text-indigo-500 animate-pulse z-10" />
            <Input
              id="ai-query"
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g. Authentic tapas away from tourist spots..."
              disabled={disabled || isLoading}
              className="pl-10 pr-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_hsl(var(--background))]"
            />
            <button 
              type="button"
              onClick={handleInputSearch}
              className="absolute right-2 p-2 bg-indigo-50 dark:bg-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              disabled={disabled || isLoading || !customInput.trim()}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {querySuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={`rounded-full text-sm px-4 py-2 font-medium transition-colors ${suggestion.className} cursor-pointer`}
              onClick={() => handleSuggestionClick(suggestion.query)}
              disabled={disabled || isLoading}
            >
              <span className="mr-1">{suggestion.emoji}</span>
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {hasSearched && !isLoading && restaurants.length > 0 && (
        <div className="">
          <p className="text-sm font-medium text-muted-foreground mb-3">TOP SUGGESTIONS</p>
          
          <div className="space-y-3 max-h-[320px] pr-2">
            {restaurants.map((restaurant, index) => (
              <RestaurantSuggestionCard
                key={index}
                restaurant={restaurant}
                isSelected={selectedIndex === index}
                onSelect={() => handleRestaurantClick(restaurant, index)}
              />
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && restaurants.length === 0 && !error && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">No restaurants found. Try a different search.</p>
        </div>
      )}
    </div>
  );
};

export default AIDiningSearch;
