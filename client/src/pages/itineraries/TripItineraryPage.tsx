import { useTripStore } from "@/stores/tripStore";
import { useItineraryStore } from "@/stores/itineraryStore";
import { useEffect } from "react";
import { DateCard } from "./components/DateCard";
import { TripDayPage } from "../tripday/TripDayPage";

export function TripItineraryPage() {
  const itineraryId = useTripStore(state => state.itinerary.id);
  const { 
    days, 
    isLoading, 
    error, 
    setItineraryData, 
    selectedDayId, 
    selectDay 
  } = useItineraryStore();
  
  const selectedDay = selectedDayId ? days.find(day => day.id === selectedDayId) || null : null;

  useEffect(() => {
    if (itineraryId) {
      console.log("Fetching itinerary for ID:", itineraryId);
      setItineraryData(itineraryId);
    }
  }, [itineraryId, setItineraryData]);

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
                <DateCard date={new Date(day.date)} index={index} setDay={() => selectDay(day.id)} />
              </div>
            ))}
          </div>
          <hr />

          {selectedDay && (
            <div>
              <TripDayPage day={selectedDay} />
            </div>
          )}
        </div>

      ) : (
        <p>No itinerary data available</p>
      )}
    </div>
  );
}