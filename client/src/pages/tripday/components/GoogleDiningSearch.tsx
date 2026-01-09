import { Label } from '@/components/ui/label';
import PlaceInput from "./PlaceInput";
import React from "react";
import type { Place } from "./PlaceInput";

interface GoogleDiningSearchProps {
  placeName: string;
  onPlaceNameChange: (value: string) => void;
  onPlaceSelect: (place: Place | null) => void;
  disabled?: boolean;
}

const GoogleDiningSearch: React.FC<GoogleDiningSearchProps> = ({
  placeName,
  onPlaceNameChange,
  onPlaceSelect,
  disabled = false
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="restaurant-name">Restaurant Name</Label>
        <PlaceInput
          value={placeName}
          onChange={onPlaceNameChange}
          onPlaceSelect={onPlaceSelect}
          placeholder="e.g. Starbucks, McDonald's..."
          disabled={disabled}
          includedTypes={['restaurant', 'food', 'cafe', 'meal_takeaway', 'bar']}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-gray-500">
          Powered by Google Places API
        </p>
      </div>
    </div>
  );
};

export default GoogleDiningSearch;
