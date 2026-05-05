import { useTripStore } from "@/stores/tripStore";
import { useItineraryStore } from "@/stores/itineraryStore";
import { useTripDayStore } from "@/stores/tripDayStore";
import { useDraftStore } from "@/stores/draftStore";
import { useEffect, useState, useCallback } from "react";
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
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { GenerateItineraryDialog } from "./components/GenerateItineraryDialog";
import { DraftPreview } from "./components/DraftPreview";
import { useDraftSocketListeners } from "./hooks/useDraftSocketListeners";
import type { UserPreferences } from "@/types/draft";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


export function TripItineraryPage() {
  const tripId = useTripStore(state => state.id);
  const startDate = useTripStore(state => state.startDate);
  const endDate = useTripStore(state => state.endDate);
  const latitude = useTripStore(state => state.latitude);
  const longitude = useTripStore(state => state.longitude);
  const hasFlights = useTripStore(state => state.flights.length > 0);
  const hasLodging = useTripStore(state => state.lodgings.length > 0);
  const tripDay = useTripDayStore(state => state.tripDay);
  const [showDatesSetter, setShowDatesSetter] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const {
    draft,
    isGenerating,
    generatingDayNumber,
    error: draftError,
    setGenerating,
    clearDraft,
    removeActivity,
  } = useDraftStore();

  const isDraftMode = draft !== null || isGenerating;

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
  const hasExistingActivities = days.some(d => (d.activities?.length ?? 0) > 0);

  useEffect(() => {
    if (draftError) {
      toast.error(draftError);
      useDraftStore.getState().setError(null);
    }
  }, [draftError]);

  const handleDraftAccepted = useCallback(async () => {
    if (!tripId) return;
    try {
      setIsLoading(true);
      const response = await itinerariesApi.getItinerary(tripId);
      setItineraryData(formatItineraryFromAPI(response.data) as Itinerary);
    } catch {
      setError('Failed to reload itinerary after accepting draft');
    } finally {
      setIsLoading(false);
    }
  }, [tripId, setIsLoading, setItineraryData, setError]);

  useDraftSocketListeners(handleDraftAccepted, clearDraft);

  useEffect(() => {
    if (!tripId || hasNoTripDates) return;
    // Always clear stale draft from a previous trip before loading this trip's draft
    clearDraft();
    itinerariesApi.getDraft(tripId).then(res => {
      if (res.data) useDraftStore.getState().setDraft(res.data);
    }).catch(() => {});
  }, [tripId]); // tripId only — hasNoTripDates change must not wipe an in-progress draft

  const handleGenerate = async (preferences: UserPreferences) => {
    if (!tripId) return;
    setShowGenerateDialog(false);
    clearDraft();
    setGenerating(true, 1);
    try {
      await itinerariesApi.generateDraft(tripId, preferences);
    } catch {
      useDraftStore.getState().setError('Failed to start generation');
    }
  };

  const handleRemoveActivity = async (tripDayId: string, activityIndex: number) => {
    if (!tripId) return;
    removeActivity(tripDayId, activityIndex); // optimistic
    try {
      await itinerariesApi.removeDraftActivity(tripId, tripDayId, activityIndex);
    } catch {
      // Revert on error
      const res = await itinerariesApi.getDraft(tripId);
      if (res.data) useDraftStore.getState().setDraft(res.data);
    }
  };

  const handleAcceptDraft = async () => {
    if (!tripId) return;
    try {
      await itinerariesApi.acceptDraft(tripId);
    } catch {
      setError('Failed to accept draft');
    }
  };

  const handleDiscardDraft = async () => {
    if (!tripId) return;
    try {
      await itinerariesApi.discardDraft(tripId);
    } catch {
      clearDraft();
    }
  };

  const handleActivityHover = (activityId: string) => setHoveredActivityId(activityId);
  const handleActivityLeave = () => setHoveredActivityId(null);

  useEffect(() => {
    const fetchItineraryData = async () => {
      if (tripId && !hasNoTripDates) {
        try {
          setIsLoading(true);
          const response = await itinerariesApi.getItinerary(tripId);
          setItineraryData(formatItineraryFromAPI(response.data) as Itinerary);
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

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  if (hasNoTripDates) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center mb-6 max-w-md">
          <h2 className="text-xl font-semibold mb-3 text-foreground">Your trip has no dates</h2>
          <p className="text-muted-foreground">
            Add trip dates to start working on your itinerary.
          </p>
        </div>
        {!showDatesSetter ? (
          <button
            onClick={() => setShowDatesSetter(true)}
            className="bg-linear-to-r from-primary to-violet-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-white px-6 py-3 rounded-lg font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
        </div>
      ) : error ? (
        <p className="p-6 text-destructive">Error: {error}</p>
      ) : days.length > 0 ? (
        <div className="flex h-full">
          {/* Left Section */}
          <div className="w-full md:w-3/5 flex flex-col mt-2">

            {/* Draft Banner */}
            {isDraftMode && (
              <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {isGenerating ? (
                    <Loader2 size={16} className="text-primary shrink-0 animate-spin" />
                  ) : (
                    <Sparkles size={16} className="text-primary shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">
                    {isGenerating
                      ? `Building your itinerary${generatingDayNumber ? ` — Day ${generatingDayNumber}` : ''}…`
                      : 'AI-Generated Draft — remove unwanted activities, then accept'}
                  </span>
                </div>
                {!isGenerating && draft && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDiscardDraft}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-lg hover:bg-destructive/10"
                    >
                      <XCircle size={14} />
                      Discard
                    </button>
                    <button
                      onClick={handleAcceptDraft}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <CheckCircle2 size={14} />
                      Accept Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sticky Dates Picker */}
            <div className={`sticky ${isDraftMode ? 'top-[52px]' : 'top-0'} z-40 bg-background/90 backdrop-blur-sm border-b border-border/60`}>
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

            {/* Date header + Generate button */}
            {selectedDay && (
              <div className={`sticky ${isDraftMode ? 'top-[124px]' : 'top-[73px]'} z-30 bg-background/90 backdrop-blur-sm border-b border-border/60 flex justify-between items-center px-4 py-3`}>
                <h2 className="text-lg font-semibold text-foreground">
                  {new Date(selectedDay.date).getDate()} {monthNames[new Date(selectedDay.date).getMonth()]}, {new Date(selectedDay.date).getFullYear()}
                </h2>
                {!isDraftMode && (
                  <button
                    onClick={() => setShowGenerateDialog(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-primary/40 hover:border-primary px-3 py-1.5 rounded-lg transition-all hover:bg-primary/5"
                  >
                    <Sparkles size={13} />
                    Generate with AI
                  </button>
                )}
              </div>
            )}

            {/* Draft view OR normal activity view */}
            <div className="flex-1 overflow-y-auto p-2">
              {isDraftMode && selectedDay ? (
                (() => {
                  const draftDay = draft?.days.find(d => d.tripDayId === selectedDay.id);
                  const isDayGenerating = isGenerating && !draftDay;

                  if (!draftDay && !isDayGenerating) {
                    return <p className="p-4 text-sm text-muted-foreground">No activities generated for this day yet.</p>;
                  }

                  if (draftDay) {
                    return (
                      <DraftPreview
                        draftDay={draftDay}
                        isLoading={isDayGenerating}
                        onRemoveActivity={handleRemoveActivity}
                      />
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Loader2 size={28} className="animate-spin text-primary" />
                      <p className="text-sm">Generating activities for this day…</p>
                    </div>
                  );
                })()
              ) : selectedDay ? (
                <TripDayPage
                  id={selectedDay.id}
                  onActivityHover={handleActivityHover}
                  onActivityLeave={handleActivityLeave}
                  onGenerateWithAI={() => setShowGenerateDialog(true)}
                />
              ) : null}
            </div>
          </div>

          {/* Right Section: Map - Desktop Only */}
          {(() => {
            // Compute markers for either draft mode or normal mode
            const draftDay = selectedDay ? draft?.days.find(d => d.tripDayId === selectedDay.id) : undefined;
            const draftMarkers = draftDay
              ? draftDay.activities
                  .filter(a => !a.removed && a.lat !== null && a.lon !== null)
                  .map((a, i) => ({
                    id: `draft-${i}`,
                    lat: a.lat!,
                    lng: a.lon!,
                    placeName: a.name,
                    index: i + 1,
                    hasTime: false,
                  }))
              : [];
            const normalMarkers = tripDay?.activities
              .filter(a => a.latitude && a.longitude)
              .map((a, _i, arr) => {
                const withTime = arr.filter(x => x.startTime);
                const idx = withTime.findIndex(x => x.id === a.id);
                return { id: a.id, lat: a.latitude!, lng: a.longitude!, placeName: a.name, index: idx + 1, hasTime: !!a.startTime };
              }) ?? [];
            const markers = isDraftMode ? draftMarkers : normalMarkers;
            // Always show map in draft mode (even with 0 markers while generating)
            const showMap = selectedDay && (isDraftMode || !!tripDay);

            return (
              <>
                <div className="hidden md:block w-2/5 h-full p-3">
                  <div className="w-full h-full rounded-xl overflow-hidden shadow-lg ring-1 ring-border/40">
                    {showMap && (
                      <GoogleMaps
                        center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                        markers={markers}
                        hoveredMarkerId={hoveredActivityId || undefined}
                      />
                    )}
                  </div>
                </div>

                {/* Mobile Map Button — shown whenever there are markers */}
                {showMap && (
                  <button
                    onClick={() => setShowMobileMap(true)}
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-linear-to-r from-primary to-violet-500 hover:shadow-lg hover:-translate-y-0.5 text-white font-medium py-3 px-6 rounded-full shadow-lg flex items-center gap-2 z-40 transition-all duration-200"
                  >
                    <FaMap />
                    View Map
                  </button>
                )}

                {/* Mobile Map Modal */}
                {showMobileMap && (
                  <div className="md:hidden fixed top-[180px] left-0 right-0 bottom-0 z-40 flex items-end justify-center">
                    <div className="bg-background w-full h-[calc(100%-20px)] rounded-t-2xl overflow-hidden relative">
                      <button
                        onClick={() => setShowMobileMap(false)}
                        className="absolute top-4 right-4 z-10 bg-card hover:bg-secondary p-2 rounded-full shadow-lg transition-colors"
                      >
                        <IoClose className="text-2xl text-gray-700 dark:text-gray-300" />
                      </button>
                      <div className="w-full h-full">
                        {showMap && (
                          <GoogleMaps
                            center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                            markers={markers}
                            hoveredMarkerId={hoveredActivityId || undefined}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <p className="p-6 text-sm text-muted-foreground">No itinerary data available</p>
      )}

      {showGenerateDialog && (
        <GenerateItineraryDialog
          onClose={() => setShowGenerateDialog(false)}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          hasExistingActivities={hasExistingActivities}
          hasFlights={hasFlights}
          hasLodging={hasLodging}
        />
      )}
    </div>
  );
}
