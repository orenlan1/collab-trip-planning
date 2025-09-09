import { fi } from "date-fns/locale";
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
}

const PlaceInput: React.FC<PlaceInputProps> = ({ value, onChange, onPlaceSelect }) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Initialize geocoder
  useEffect(() => {
    if (window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, []);

//   useEffect(() => {
//     if (!value || !window.google || !window.google.maps || !window.google.maps.places || !isTyping) {
//       setSuggestions([]);
//       return;
//     }

//     if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

//     debounceTimeout.current = window.setTimeout(() => {
//       setLoading(true);
           
//       const service = new window.google.maps.places.AutocompleteService();
//       service.getPlacePredictions({ input: value }, (predictions, status) => {
//         if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
//           setSuggestions(predictions);
//         } else {
//           setSuggestions([]);
//         }
//         setLoading(false);
//       });
//     }, 500);

//     return () => {
//       if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
//     };
//   }, [value, isTyping]);

    useEffect(() => {
      if (!value || !window.google || !window.google.maps || !window.google.maps.places || !isTyping) {
        setSuggestions([]);
        return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = window.setTimeout(() => {
        setLoading(true);
        google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({input: value})
          .then(predictions => {
            setSuggestions(predictions.suggestions || []);
          })
          .catch(error => {
            console.error('Error fetching autocomplete suggestions:', error);
            setSuggestions([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }, 500);

      return () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      };
    }, [value, isTyping]);



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
      <input className="text-base bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
        value={value || ""}
        onChange={e => {
          setIsTyping(true);
          onChange(e.target.value)
        }}
        placeholder="Enter a place"
        style={{ width: "100%", padding: "8px" }}
        autoComplete="off"
      />
      {loading && <div style={{ position: "absolute", background: "white", zIndex: 2, width: "100%" }}>Loading...</div>}
      {suggestions.length > 0 && (
        <ul style={{
          position: "absolute",
          background: "white",
          border: "1px solid #ccc",
          width: "100%",
          margin: 0,
          padding: 0,
          listStyle: "none",
          zIndex: 2,
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {suggestions.map(s => (
            <li
              key={s.placePrediction?.placeId}
              onClick={() => {   
                handleSuggestionSelect(s.placePrediction!);
              }}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              {s.placePrediction?.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceInput;