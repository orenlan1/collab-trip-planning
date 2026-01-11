import { useTripStore } from "@/stores/tripStore";
import { useItineraryStore } from "@/stores/itineraryStore";
import { useTripDayStore } from "@/stores/tripDayStore";
import { useEffect, useState } from "react";
import { TailSpin } from 'react-loader-spinner';
import { DateCard } from "./components/DateCard";
import { TripDayPage } from "../tripday/TripDayPage";
import { itinerariesApi } from "./services/api"; 
import { formatItineraryFromAPI } from "@/lib/utils";
import type { Itinerary } from "@/types/itinerary";
import { DatesSetter } from "../trips/components/DatesSetter";
import { GoogleMaps } from "@/components/GoogleMaps";
import { FaMap } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


export function TripItineraryPage() {
  const tripId = useTripStore(state => state.id);
  const startDate = useTripStore(state => state.startDate);
  const endDate = useTripStore(state => state.endDate);
  const latitude = useTripStore(state => state.latitude);
  const longitude = useTripStore(state => state.longitude);
  const tripDay = useTripDayStore(state => state.tripDay);
  const [showDatesSetter, setShowDatesSetter] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  
  
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

  const handleActivityHover = (activityId: string) => {
    setHoveredActivityId(activityId);
  };

  const handleActivityLeave = () => {
    setHoveredActivityId(null);
  };

  useEffect(() => {
    const fetchItineraryData = async () => {
      if (tripId && !hasNoTripDates) {
        try {
          setIsLoading(true);
          const response = await itinerariesApi.getItinerary(tripId);
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
  }, [tripId, startDate, endDate, setItineraryData, setIsLoading, setError]);

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
    <div className="h-[calc(100vh-73px)]">
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
          <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
        </div>
      ) : error ? (
        <p>Error: {error}</p>
      ) : days.length > 0 ? (
        <div className="flex h-full">
          {/* Left Section: Dates Picker + Activity Cards */}
          <div className="w-full md:w-3/5 flex flex-col mt-2">
            {/* Sticky Dates Picker */}
            <div className="sticky top-0 z-40 bg-sky-50/60 dark:bg-slate-900  border-neutral-200/40 dark:border-neutral-800/60">
              <div className="py-3 px-4">
                <div 
                  className={`overflow-x-auto scrollbar-hide flex gap-3 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
            </div>

            {/* Date and New Activity Button */}
            {selectedDay && (
              <div className="sticky top-[73px] z-30 bg-sky-50/60 dark:bg-slate-900 border-b border-neutral-200/40 dark:border-neutral-800/60 flex justify-between items-center p-4">
                <div className="text-lg font-semibold">
                  <h2>{new Date(selectedDay.date).getDate()} {monthNames[new Date(selectedDay.date).getMonth()]}, {new Date(selectedDay.date).getFullYear()}</h2>
                </div>
              </div>
            )}

            {/* Activity Cards - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2">
              {selectedDay && (
                <TripDayPage 
                  id={selectedDay.id}
                  onActivityHover={handleActivityHover}
                  onActivityLeave={handleActivityLeave}
                />
              )}
            </div>
          </div>

          {/* Right Section: Google Map - Desktop Only */}
          <div className="hidden md:block w-2/5 h-full">
            {selectedDay && tripDay && (
              <GoogleMaps 
                center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                markers={tripDay.activities
                  .filter(activity => activity.latitude && activity.longitude)
                  .map((activity, _idx, arr) => {
                  const activitiesWithTime = arr.filter(a => a.startTime);
                  const indexInTimed = activitiesWithTime.findIndex(a => a.id === activity.id);
                  return {
                    id: activity.id,
                    lat: activity.latitude || 0,
                    lng: activity.longitude || 0,
                    placeName: activity.name,
                    index: indexInTimed + 1,
                    hasTime: !!activity.startTime
                  };
                }) || []}
                hoveredMarkerId={hoveredActivityId || undefined}
              />
            )}
          </div>

          {/* Mobile Map Button */}
          <button
            onClick={() => setShowMobileMap(true)}
            className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-full shadow-lg flex items-center gap-2 z-40"
          >
            <FaMap />
            View Map
          </button>

          {/* Mobile Map Modal */}
          {showMobileMap && (
            <div className="md:hidden fixed top-[180px] left-0 right-0 bottom-0 z-40 flex items-end justify-center">
              <div className="bg-white dark:bg-slate-900 w-full h-[calc(100%-20px)] rounded-t-2xl overflow-hidden relative">
                <button
                  onClick={() => setShowMobileMap(false)}
                  className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full shadow-lg"
                >
                  <IoClose className="text-2xl text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-full h-full">
                  {selectedDay && tripDay && (
                    <GoogleMaps 
                      center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                      markers={tripDay.activities
                        .filter(activity => activity.latitude && activity.longitude)
                        .map((activity, _idx, arr) => {
                        const activitiesWithTime = arr.filter(a => a.startTime);
                        const indexInTimed = activitiesWithTime.findIndex(a => a.id === activity.id);
                        return {
                          id: activity.id,
                          lat: activity.latitude || 0,
                          lng: activity.longitude || 0,
                          placeName: activity.name || activity.address || 'Unnamed Activity',
                          index: indexInTimed + 1,
                          hasTime: !!activity.startTime
                        };
                      }) || []}
                      hoveredMarkerId={hoveredActivityId || undefined}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No itinerary data available</p>
      )}
    </div>
  );
}