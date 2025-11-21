import React, { useState, useEffect, useRef } from "react";

export interface Place {
  id: string;
  name: string;
  address: string;
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

    suggestion.toPlace().fetchFields({fields: ['formattedAddress']})
    .then(place => {
        const selectedPlace: Place = {
            id: suggestion.placeId || "",
            name: suggestion.mainText?.text || "",
            address: place.place?.formattedAddress || "",
        };
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
      {loading && (
        <div style={{ 
          position: "absolute", 
          background: "white", 
          zIndex: 10, 
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc"
        }}>
          Loading...
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <ul style={{
          position: "absolute",
          background: "white",
          border: "1px solid #ccc",
          width: "100%",
          margin: 0,
          padding: 0,
          listStyle: "none",
          zIndex: 10,
          maxHeight: "200px",
          overflowY: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          {suggestions.map((s, index) => (
            <li
              key={s.placePrediction?.placeId || index}
              onClick={() => {   
                handleSuggestionSelect(s.placePrediction!);
              }}
              style={{ 
                padding: "8px", 
                cursor: "pointer",
                borderBottom: index < suggestions.length - 1 ? "1px solid #eee" : "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              {s.placePrediction?.text.text}
            </li>
          ))}
        </ul>
      )}
      {!loading && isTyping && suggestions.length === 0 && value && value.length > 2 && (
        <div style={{ 
          position: "absolute", 
          background: "white", 
          zIndex: 10, 
          width: "100%",
          padding: "8px",
          border: "1px solid #ccc",
          color: "#666"
        }}>
          No results found
        </div>
      )}
    </div>
  );
};

export default PlaceInput;