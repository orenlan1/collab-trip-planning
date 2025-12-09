import { useTripStore } from "@/stores/tripStore";
import { useState, useEffect, useRef, use } from "react";
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
  const [destinationSuggestions, setDestinationSuggestions] = useState<Destination[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const destinationRef = useRef<HTMLDivElement>(null);
  const debouncedDestination = useDebounce(destination, 300);

  // Update local state when store changes
  useEffect(() => {
    setDestination(storeDestination || '');
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
    // Mark as unsaved if different from stored value
    setHasUnsavedChanges(value !== (storeDestination || ''));
  };

  const handleDestinationSelect = async (dest: Destination) => {
    console.log('Selected destination:', dest);
    const displayText = dest.type === 'city' 
      ? `${dest.name}, ${dest.country}`
      : dest.name;
    
    setDestination(displayText);
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
    <div className="border-1 rounded-xl py-3 h-full bg-white/80 dark:bg-slate-800 shadow-sm">
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
          className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 dark:bg-slate-700 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8"
          onChange={(e) => handleDestinationChange(e.target.value)}
          onFocus={() => setShowDestinationSuggestions(true)}
          autoComplete="off"
        />
        {showDestinationSuggestions && destinationSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto left-0 right-0 mx-4">
            {destinationSuggestions.map((dest) => (
              <div
                key={`${dest.type}-${dest.id}`}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                onClick={() => handleDestinationSelect(dest)}
              >
                <div className="font-medium">{dest.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {dest.type === 'city' ? `${dest.country} • City` : 'Country'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="ml-4 text-sm text-gray-500">
          {hasUnsavedChanges 
            ? "Select a suggestion to save changes" 
            : "country, region or city"}
        </p>
      </div>
      
    </div>
  );
}
