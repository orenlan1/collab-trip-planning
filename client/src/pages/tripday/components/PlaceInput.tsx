import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface Place {
  id: string;
  name: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface PlaceInputProps {
  value: string | null;
  onChange: (val: string) => void;
  onPlaceSelect?: (place: Place) => void;
  includedTypes?: string[]; // Filter by place types (e.g., ['lodging', 'hotel'])
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Allow custom styling from parent
}

const PlaceInput: React.FC<PlaceInputProps> = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  includedTypes,
  placeholder = "Enter a place",
  disabled = false,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (loading || suggestions.length > 0 || (isTyping && value && value.length > 2)) {
        updateDropdownPosition();
        window.addEventListener('scroll', updateDropdownPosition, true);
        window.addEventListener('resize', updateDropdownPosition);
        
        return () => {
            window.removeEventListener('scroll', updateDropdownPosition, true);
            window.removeEventListener('resize', updateDropdownPosition);
        };
    }
  }, [loading, suggestions.length, isTyping, value]);

  useEffect(() => {
    if (!value || !window.google || !window.google.maps || !window.google.maps.places || !isTyping) {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = window.setTimeout(() => {
      setLoading(true);
      
      const requestOptions: any = {
        input: value
      };

      // Add type filtering if provided
      // Note: includedPrimaryTypes might not work with all Google Maps API versions
      // If filtering doesn't work, suggestions will show all place types
      if (includedTypes && includedTypes.length > 0) {
        requestOptions.includedPrimaryTypes = includedTypes;
      }
      
      console.log('Fetching suggestions with options:', requestOptions);
      
      google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(requestOptions)
        .then(predictions => {
          console.log('Received predictions:', predictions);
          const fetchedSuggestions = predictions.suggestions || [];
          console.log('Number of suggestions:', fetchedSuggestions.length);
          setSuggestions(fetchedSuggestions);
        })
        .catch(error => {
          console.error('Error fetching autocomplete suggestions:', error);
          console.error('Error details:', error.message, error.stack);
          setSuggestions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [value, isTyping, includedTypes]);



  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target as Node))
      ) {
        setSuggestions([]);
        setIsTyping(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleSuggestionSelect = (suggestion: google.maps.places.PlacePrediction) => {
    setIsTyping(false);
    onChange(suggestion.text.text || "");

    suggestion.toPlace().fetchFields({fields: ['formattedAddress', 'location']})
    .then(place => {
        const selectedPlace: Place = {
            id: suggestion.placeId || "",
            name: suggestion.mainText?.text || "",
            address: place.place?.formattedAddress || "",
            location: {
              lat: place.place?.location?.lat() || 0,
              lng: place.place?.location?.lng() || 0
            }
          };
        console.log('Selected place details:', selectedPlace);
        onPlaceSelect?.(selectedPlace);
    })
    .catch(error => {
        console.error('Error fetching place details:', error);
    });
     
    
    setSuggestions([]);
   
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input 
        className={className}
        value={value || ""}
        onChange={e => {
          setIsTyping(true);
          onChange(e.target.value)
        }}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: "100%" }}
        autoComplete="off"
      />
      {dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
            pointerEvents: "auto"
          }}
          onWheel={(e) => e.stopPropagation()}
        >
          {loading && (
            <div style={{ 
              background: "white", 
              padding: "8px",
              border: "1px solid #ccc"
            }}>
              Loading...
            </div>
          )}
          {!loading && suggestions.length > 0 && (
            <ul 
              className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 m-0 p-0 list-none overflow-y-auto shadow-md rounded-md"
              style={{
                maxHeight: "200px",
                pointerEvents: "auto"
              }}
              onMouseDown={(e) => {
                // Prevent default only if not clicking scrollbar (simple heuristic or just rely on item onMouseDown)
                // Actually, preventing default on the list itself might break scrollbar dragging in some browsers if not careful.
                // So we won't put preventDefault here, only on items.
              }}
            >
              {suggestions.map((s, index) => (
                <li
                  className="p-2 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-white"
                  key={s.placePrediction?.placeId || index}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent focus loss from input
                    handleSuggestionSelect(s.placePrediction!);
                  }}
                >
                  {s.placePrediction?.text.text }
                </li>
              ))}
            </ul>
          )}
          {!loading && isTyping && suggestions.length === 0 && value && value.length > 2 && (
            <div style={{ 
              background: "white", 
              padding: "8px",
              border: "1px solid #ccc",
              color: "#666"
            }}>
              No results found
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default PlaceInput;