import { useTripStore } from "@/stores/tripStore";
import { useItineraryStore } from "@/stores/itineraryStore";
import { useEffect, useState } from "react";
import { TailSpin } from 'react-loader-spinner';
import { DateCard } from "./components/DateCard";
import { TripDayPage } from "../tripday/TripDayPage";
import { itinerariesApi } from "./services/api"; 
import { formatItineraryFromAPI } from "@/lib/utils";
import type { Itinerary } from "@/types/itinerary";
import { DatesSetter } from "../trips/components/DatesSetter";

export function TripItineraryPage() {
  const itineraryId = useTripStore(state => state.itinerary.id);
  const startDate = useTripStore(state => state.startDate);
  const endDate = useTripStore(state => state.endDate);
  const [showDatesSetter, setShowDatesSetter] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const { 
    days, 
    isLoading,
    setIsLoading,
    error,
    setError,
    setItineraryData, 
    selectedDayId, 
    selectDay 
  } = useItineraryStore();

  const selectedDay = selectedDayId ? days.find(day => day.id === selectedDayId) || null : null;
  const hasNoTripDates = !startDate || !endDate;

  useEffect(() => {
    const fetchItineraryData = async () => {
      if (itineraryId && !hasNoTripDates) {
        try {
          setIsLoading(true);
          const response = await itinerariesApi.getItinerary(itineraryId);
          const itineraryData = formatItineraryFromAPI(response.data) as Itinerary;
          setItineraryData(itineraryData);
        } catch (error) {
          setError("Failed to load itinerary data.");
          console.error("Error fetching itinerary:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchItineraryData();
  }, [itineraryId,startDate, endDate, setItineraryData, setIsLoading, setError]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setIsDragging(true);
    setStartX(e.pageX - element.offsetLeft);
    setScrollLeft(element.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const element = e.currentTarget;
    const x = e.pageX - element.offsetLeft;
    const walk = (x - startX) * 2;
    element.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  if (hasNoTripDates) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center mb-6 max-w-md">
          <h2 className="text-xl font-semibold mb-3">Your trip has no dates</h2>
          <p className="text-gray-600">
            Add trip dates to start working on your itinerary.
          </p>
        </div>
        {!showDatesSetter ? (
          <button
            onClick={() => setShowDatesSetter(true)}
            className="bg-indigo-500 hover:bg-indigo-600 transition text-white px-6 py-3 rounded-md"
          >
            Set Trip Dates
          </button>
        ) : (
          <div className="mt-4">
            <DatesSetter />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
          <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
        </div>
      ) : error ? (
        <p>Error: {error}</p>
      ) : days.length > 0 ? (
        <div>    
          <div className="sticky top-[72px] p-4 z-40 bg-sky-50/60 dark:bg-slate-900">
            <h1 className="text-2xl font-semibold mb-4">Trip Timeline</h1>
            <div 
              className={`px-8 pb-0 mt-6 overflow-x-auto scrollbar-hide flex gap-3 pb-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {days.map((day, index) => (
                <DateCard 
                  key={day.id}
                  date={new Date(day.date)} 
                  index={index} 
                  setDay={() => selectDay(day.id)} 
                  isSelected={selectedDayId === day.id} 
                />
              ))}
            </div>
          </div>      

          {selectedDay && (
            <div>
              <TripDayPage id={selectedDay.id} />
            </div>
          )}
        </div>

      ) : (
        <p>No itinerary data available</p>
      )}
    </div>
  );
}