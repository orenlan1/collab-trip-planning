/**
 * Utility function to get dates that would be excluded when changing trip date range
 * @param currentStartDate - Current trip start date
 * @param currentEndDate - Current trip end date  
 * @param newStartDate - New proposed start date
 * @param newEndDate - New proposed end date
 * @returns Array of dates that will be excluded from the new range
 */
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
    
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return excludedDates;
}

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD) for API responses
 * Sets time to 00:00:00.000Z to ensure date-only representation
 * @param date - Date object to convert
 * @returns ISO date string in YYYY-MM-DD format
 */
export function dateToISOString(date: Date | null | undefined): string | null {
  if (!date) return null;
  const isoStr = date.toISOString();
  return isoStr.split('T')[0] || isoStr;
}

/**
 * Converts various date input formats to normalized Date object at UTC midnight
 * Handles: ISO strings, Date objects, date strings (YYYY-MM-DD)
 * @param dateInput - Date input in various formats
 * @returns Date object at UTC midnight or null if invalid
 */
export function normalizeDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  
  let dateStr: string;
  
  if (typeof dateInput === 'string') {
    // Handle ISO strings by extracting date part
    if (dateInput.includes('T')) {
      const parts = dateInput.split('T');
      dateStr = parts[0] || dateInput;
    } else {
      dateStr = dateInput;
    }
  } else if (dateInput instanceof Date) {
    const isoStr = dateInput.toISOString();
    dateStr = isoStr.split('T')[0] || isoStr;
  } else {
    return null;
  }
  
  // Validate YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${dateStr}`);
  }
  
  const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);
  
  if (isNaN(normalizedDate.getTime())) {
    throw new Error(`Failed to create valid date from: ${dateStr}`);
  }
  
  return normalizedDate;
}

/**
 * Formats trip data for API response by converting Date fields to ISO strings
 * @param trip - Trip object with Date fields (startDate and endDate can be null)
 * @returns Trip object with ISO string date fields
 */
export function formatTripForAPI(trip: any) {
  return {
    ...trip,
    startDate: trip.startDate ? dateToISOString(trip.startDate) : null,
    endDate: trip.endDate ? dateToISOString(trip.endDate) : null,
  };
}

/**
 * Formats trip day data for API response by converting Date fields to ISO strings
 * @param tripDay - TripDay object with Date field
 * @returns TripDay object with ISO string date field
 */
export function formatTripDayForAPI(tripDay: any) {
  return {
    ...tripDay,
    date: dateToISOString(tripDay.date),
  };
}


