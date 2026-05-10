import { Calendar } from "@/components/ui/calendar";
import { useTripStore } from "@/stores/tripStore";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DateRange } from "react-day-picker";
import { getExcludedDates, checkIfDateHasActivities } from "@/lib/utils";
import { tripsApi } from "../services/api";
import { dateToLocalDateString } from "@/lib/utils";
import { notifySuccess } from "@/layouts/TripLayout";

export const DatesSetter = () => {
    const tripId  = useTripStore(state => state.id);
    const startDate = useTripStore(state => state.startDate);
    const endDate = useTripStore(state => state.endDate);
    const setTripData = useTripStore(state => state.setTripData);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [datesWithActivities, setDatesWithActivities] = useState<Date[]>([]);
    const [numberOfMonths, setNumberOfMonths] = useState(() => window.innerWidth >= 768 ? 2 : 1);

    useEffect(() => {
        const handler = () => setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
   

    // Set initial dates from trip store when component mounts
    useEffect(() => {
        if (startDate && endDate) {
            // Convert ISO string dates from store to Date objects for calendar
            const startDateObj = new Date(startDate + 'T00:00:00');
            const endDateObj = new Date(endDate + 'T00:00:00');
            
            setDateRange({
                from: startDateObj,
                to: endDateObj
            });
        }
    }, [startDate, endDate]);

   
    const handleSaveDates = () => {
      // check if dateRange is defined and has both from and to dates
      if (dateRange?.from && dateRange?.to) {
        if (startDate && endDate) {
          // Convert ISO string dates from store to Date objects with consistent midnight time
          const currentStart = new Date(startDate + 'T00:00:00');
          const currentEnd = new Date(endDate + 'T00:00:00');
          
          const newStart = new Date(dateRange.from);
          newStart.setHours(0, 0, 0, 0);
          
          const newEnd = new Date(dateRange.to);
          newEnd.setHours(0, 0, 0, 0);
          
          const excludedDates = getExcludedDates(
            currentStart,
            currentEnd,
            newStart,
            newEnd
          );
          
          // Find dates with activities
          const datesWithActivitiesFound = excludedDates.filter(date => checkIfDateHasActivities(date));
          
          if (datesWithActivitiesFound.length > 0) {
            setDatesWithActivities(datesWithActivitiesFound);
            setShowWarningModal(true);
            return;
          }
        }
        
        // No conflicts, save the dates directly
        saveDatesDirectly();
      }
    };

    const saveDatesDirectly = async () => {
      if (dateRange?.from && dateRange?.to) {
        try {
            const response = await tripsApi.update(tripId, {
            startDate: dateToLocalDateString(dateRange.from),
            endDate: dateToLocalDateString(dateRange.to)
          });
          setTripData(response.data);
          notifySuccess("Trip dates updated successfully");
        } catch (error) {
          console.error("Error saving dates:", error);
        }
        console.log("Saving dates:", dateRange.from, "to", dateRange.to);
      }
    };

    const handleConfirmDelete = () => {
      // TODO: Delete activities for the excluded dates
      console.log("Deleting activities for dates:", datesWithActivities);
      saveDatesDirectly();
      setShowWarningModal(false);
      setDatesWithActivities([]);
    };

    const handleCancelChange = () => {
      setShowWarningModal(false);
      setDatesWithActivities([]);
      // Reset date range to original values
      setDateRange({
        from: startDate ? new Date(startDate + 'T00:00:00') : undefined,
        to: endDate ? new Date(endDate + 'T00:00:00') : undefined,
      });
    };

  return (
    <div className="pt-7">
      {!startDate && !endDate && (
        <div className="px-4 pb-1">
          <p className="text-sm font-medium text-foreground">Select trip dates</p>
          <p className="text-xs text-muted-foreground mt-0.5">Choose a start and end date for your trip</p>
        </div>
      )}
      <Calendar
        mode="range"
        numberOfMonths={numberOfMonths}
        selected={dateRange}
        onSelect={setDateRange}
        initialFocus
      />
      <button
        onClick={handleSaveDates}
        className="bg-indigo-500 hover:bg-indigo-600 transition text-white m-4 px-4 py-2 rounded-md"
      >
        Save
      </button>

      {/* Warning Modal - Using Portal to escape component boundaries */}
      {showWarningModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            onClick={handleCancelChange}
          />
          <div className="relative bg-background border border-border rounded-lg shadow-xl w-96 p-6 max-w-[90vw] max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Warning: Activities Will Be Deleted
            </h3>
            <p className="text-muted-foreground mb-4">
              The following dates have activities planned that will be deleted if you proceed:
            </p>
            <ul className="list-disc list-inside mb-6 text-muted-foreground">
              {datesWithActivities.map((date, index) => (
                <li key={index}>
                  {date.toLocaleDateString()}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelChange}
                className="px-4 py-2 text-foreground bg-secondary rounded hover:bg-secondary/80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-white bg-destructive rounded hover:bg-destructive/90 transition"
              >
                Delete Activities & Save Dates
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}