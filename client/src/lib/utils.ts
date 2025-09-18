import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useItineraryStore } from "@/stores/itineraryStore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts ISO date string from API to Date object for client-side usage
 * Handles both YYYY-MM-DD and full ISO string formats
 * @param isoString - ISO date string from API
 * @returns Date object at local timezone or null if invalid
 */
export function isoStringToDate(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  
  let dateStr: string;
  
  // Extract date part if it's a full ISO string
  if (isoString.includes('T')) {
    const parts = isoString.split('T');
    dateStr = parts[0] || isoString;
  } else {
    dateStr = isoString;
  }
  
  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.warn(`Invalid date format received from API: ${isoString}`);
    return null;
  }
  
  // Create date at local timezone (not UTC) for client usage
  const date = new Date(dateStr + 'T00:00:00');
  
  if (isNaN(date.getTime())) {
    console.warn(`Failed to create valid date from: ${isoString}`);
    return null;
  }
  
  return date;
}

/**
 * Converts Date object to local date string (YYYY-MM-DD) for API requests
 * Uses local date components to avoid timezone conversion issues
 * @param date - Date object to convert
 * @returns Local date string in YYYY-MM-DD format
 */
export function dateToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats trip data received from API by converting ISO string dates to Date objects
 * @param tripData - Trip data from API with ISO string dates
 * @returns Trip data with Date objects
 */
export function formatTripFromAPI(tripData: any) {
  return {
    ...tripData,
    startDate: isoStringToDate(tripData.startDate),
    endDate: isoStringToDate(tripData.endDate),
  };
}

/**
 * Formats trip day data received from API by converting ISO string date to Date object
 * @param tripDayData - TripDay data from API with ISO string date
 * @returns TripDay data with Date object
 */
export function formatTripDayFromAPI(tripDayData: any) {
  return {
    ...tripDayData,
    date: isoStringToDate(tripDayData.date),
  };
}

/**
 * Formats itinerary data received from API by converting ISO string dates to Date objects
 * @param itineraryData - Itinerary data from API with nested trip days
 * @returns Itinerary data with Date objects
 */
export function formatItineraryFromAPI(itineraryData: any) {
  return {
    ...itineraryData,
    days: itineraryData.days?.map(formatTripDayFromAPI) || [],
  };
}

export function checkIfDateHasActivities(date: Date) : boolean {
  const { days } = useItineraryStore.getState();
  const inputDateString = dateToLocalDateString(date);
  const tripDay = days.find(d => {
    const storedDateString = dateToLocalDateString(new Date(d.date));
    return storedDateString === inputDateString;
  });
  if (tripDay?.activities && tripDay.activities.length > 0) {
    return true;
  }
  return false;
}

export function getExcludedDates(
  currentStartDate: Date, 
  currentEndDate: Date, 
  newStartDate: Date, 
  newEndDate: Date
): Date[] {
  const excludedDates: Date[] = [];
  
  const currentDate = new Date(currentStartDate);
  while (currentDate <= currentEndDate) {
    const dateToCheck = new Date(currentDate);
    
    if (dateToCheck < newStartDate || dateToCheck > newEndDate) {
      excludedDates.push(dateToCheck);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return excludedDates;
}
