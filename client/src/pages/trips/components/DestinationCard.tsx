import { useTripStore } from "@/stores/tripStore";
import { useState, useEffect, useRef } from "react";
import { FiMapPin } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { tripsApi } from "../services/api";
import { destinationsApi, type Destination } from "../services/destinations-api";
import { useDebounce } from "@/hooks/useDebounce";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export function DestinationCard() {
  const { tripId } = useParams<{ tripId: string }>();
  const storeDestination = useTripStore(state => state.destination);
  const setStoreDestination = useTripStore(state => state.setDestination);

  const [destination, setDestination] = useState(storeDestination || '');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(storeDestination || null);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Destination[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const destinationRef = useRef<HTMLDivElement>(null);
  const debouncedDestination = useDebounce(destination, 300);

  // Update local state when store changes
  useEffect(() => {
    setDestination(storeDestination || '');
    setSelectedDestination(storeDestination || null);
    setHasUnsavedChanges(false);
  }, [storeDestination]);

  // Search destinations for autocomplete
  useEffect(() => {
    if (debouncedDestination.length >= 2 && showDestinationSuggestions) {
      destinationsApi.search(debouncedDestination)
        .then(res => {
          console.log('Destination search results:', res.data);
          setDestinationSuggestions(res.data)
        })
        .catch(err => console.error('Failed to search destinations:', err));
    } else {
      setDestinationSuggestions([]);
    }
  }, [debouncedDestination, showDestinationSuggestions]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    if (selectedDestination && value !== selectedDestination) {
      setSelectedDestination(null);
    }
    setHasUnsavedChanges(value !== (storeDestination || ''));
  };

  const handleDestinationSelect = async (dest: Destination) => {
    console.log('Selected destination:', dest);
    const displayText = dest.type === 'city' 
      ? `${dest.name}, ${dest.country}`
      : dest.name;
    
    setDestination(displayText);
    setSelectedDestination(displayText);
    setShowDestinationSuggestions(false);
    setHasUnsavedChanges(false);

    // Save immediately after selection
    if (tripId) {
      try {
        await tripsApi.update(tripId, { destination: displayText });
        setStoreDestination(displayText);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } catch (error) {
        console.error('Failed to update destination:', error);
      }
    }
  }


  return (
    <div className="border border-border/60 rounded-xl py-3 h-full bg-card shadow-sm">
      <div className="flex px-4 gap-3 items-center">
        <FiMapPin className="text-xl text-indigo-500" />
        <h1 className="font-semibold text-xl">Destination</h1>
        {showSaved && (
          <div className="flex items-center gap-1 text-green-600">
            <IoCheckmarkCircleOutline className="text-lg" />
            <span className="text-sm">Saved</span>
          </div>
        )}
        {!showSaved && hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-amber-600">
            <span className="text-sm">Unsaved changes</span>
          </div>
        )}
      </div>
      <div className="relative p-4" ref={destinationRef}>
        <FiMapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={destination ?? ""}
          className="w-full focus:outline-none focus:ring-0 focus:border-primary/60 transition-colors text-sm bg-transparent border-2 border-border rounded-lg pt-3 pr-4 pb-3 pl-8 text-foreground placeholder:text-muted-foreground"
          onChange={(e) => handleDestinationChange(e.target.value)}
          onFocus={() => setShowDestinationSuggestions(true)}
          autoComplete="off"
        />
        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-xl shadow-lg max-h-60 overflow-auto left-0 right-0 mx-4">
            {destinationSuggestions.map((dest) => (
              <div
                key={`${dest.type}-${dest.id}`}
                className="px-3 py-2.5 cursor-pointer hover:bg-secondary transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleDestinationSelect(dest)}
              >
                <div className="font-medium">{dest.name}</div>
                <div className="text-xs text-muted-foreground">
                  {dest.type === 'city' ? `${dest.country} • City` : 'Country'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="ml-4 text-sm text-muted-foreground">
          {!selectedDestination && destination
            ? "Please select a destination from the suggestions" 
            : hasUnsavedChanges
            ? "Select a suggestion to save changes" 
            : "Search and select a destination"}
        </p>
      </div>
      
    </div>
  );
}
