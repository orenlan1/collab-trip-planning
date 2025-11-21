import { useTripStore } from "@/stores/tripStore";
import { useItineraryStore } from "@/stores/itineraryStore";
import { useEffect, useState } from "react";
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
      <h1 className="text-2xl font-semibold mb-4">Trip Timeline</h1>
      {isLoading ? (
        <p>Loading itinerary...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : days.length > 0 ? (
        <div>
          <hr />
          <div className="flex justify-around overflow-x-auto gap-5 m-10">
            {days.map((day, index) => (
              <div key={day.id}>
                <DateCard date={new Date(day.date)} index={index} setDay={() => selectDay(day.id)} 
                  isSelected={selectedDayId === day.id} />
              </div>
            ))}
          </div>
          <hr />

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