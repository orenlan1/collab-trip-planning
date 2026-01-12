import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { TimePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { airportsApi, type Airport } from '@/pages/flights/services/airports-api';
import { airlinesApi, type Airline } from '@/pages/flights/services/airlines-api';
import { useDebounce } from '@/hooks/useDebounce';

interface FlightFormProps {
  airline: string;
  setAirline: (value: string) => void;
  flightNumber: string;
  setFlightNumber: (value: string) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  departureDate: Date | undefined;
  setDepartureDate: (date: Date | undefined) => void;
  departureTime: Dayjs | null;
  setDepartureTime: (time: Dayjs | null) => void;
  arrivalDate: Date | undefined;
  setArrivalDate: (date: Date | undefined) => void;
  arrivalTime: Dayjs | null;
  setArrivalTime: (time: Dayjs | null) => void;
  isSubmitting: boolean;
  error: string;
  onDepartureAirportSelect?: (airport: Airport) => void;
  onArrivalAirportSelect?: (airport: Airport) => void;
}

export function FlightForm({
  airline,
  setAirline,
  flightNumber,
  setFlightNumber,
  from,
  setFrom,
  to,
  setTo,
  departureDate,
  setDepartureDate,
  departureTime,
  setDepartureTime,
  arrivalDate,
  setArrivalDate,
  arrivalTime,
  setArrivalTime,
  isSubmitting,
  error,
  onDepartureAirportSelect,
  onArrivalAirportSelect,
}: FlightFormProps) {
  // Autocomplete states
  const [airlineSuggestions, setAirlineSuggestions] = useState<Airline[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<Airport[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Airport[]>([]);
  
  const [showAirlineSuggestions, setShowAirlineSuggestions] = useState(false);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  // Refs for click outside detection
  const airlineRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Debounced search values
  const debouncedAirline = useDebounce(airline, 300);
  const debouncedFrom = useDebounce(from, 300);
  const debouncedTo = useDebounce(to, 300);

  // Search airlines
  useEffect(() => {
    if (debouncedAirline.length >= 2) {
      airlinesApi.search(debouncedAirline)
        .then(res => setAirlineSuggestions(res.data))
        .catch(err => console.error('Failed to search airlines:', err));
    } else {
      setAirlineSuggestions([]);
    }
  }, [debouncedAirline]);

  // Search departure airports
  useEffect(() => {
    if (debouncedFrom.length >= 2) {
      airportsApi.search(debouncedFrom)
        .then(res => setFromSuggestions(res.data))
        .catch(err => console.error('Failed to search airports:', err));
    } else {
      setFromSuggestions([]);
    }
  }, [debouncedFrom]);

  // Search arrival airports
  useEffect(() => {
    if (debouncedTo.length >= 2) {
      airportsApi.search(debouncedTo)
        .then(res => setToSuggestions(res.data))
        .catch(err => console.error('Failed to search airports:', err));
    } else {
      setToSuggestions([]);
    }
  }, [debouncedTo]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (airlineRef.current && !airlineRef.current.contains(event.target as Node)) {
        setShowAirlineSuggestions(false);
      }
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAirlineSelect = (airlineData: Airline) => {
    setAirline(airlineData.name);
    setShowAirlineSuggestions(false);
  };

  const handleFromSelect = (airport: Airport) => {
    const displayText = airport.iata 
      ? `${airport.iata} - ${airport.name}, ${airport.city || ''}, ${airport.country || ''}`
      : `${airport.name}, ${airport.city || ''}, ${airport.country || ''}`;
    setFrom(displayText);
    setShowFromSuggestions(false);
    if (onDepartureAirportSelect) {
      onDepartureAirportSelect(airport);
    }
  };

  const handleToSelect = (airport: Airport) => {
    const displayText = airport.iata 
      ? `${airport.iata} - ${airport.name}, ${airport.city || ''}, ${airport.country || ''}`
      : `${airport.name}, ${airport.city || ''}, ${airport.country || ''}`;
    setTo(displayText);
    setShowToSuggestions(false);
    if (onArrivalAirportSelect) {
      onArrivalAirportSelect(airport);
    }
  };

  return (
    <div className="space-y-4 py-4">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Airline and Flight Number */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2" ref={airlineRef}>
          <Label htmlFor="airline">Airline *</Label>
          <div className="relative">
            <Input
              id="airline"
              placeholder="e.g., Delta, United"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              onFocus={() => setShowAirlineSuggestions(true)}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {showAirlineSuggestions && airlineSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {airlineSuggestions.map((airlineItem) => (
                  <div
                    key={airlineItem.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    onClick={() => handleAirlineSelect(airlineItem)}
                  >
                    <div className="font-medium">{airlineItem.name}</div>
                    {airlineItem.alias && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {airlineItem.alias}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="flightNumber">Flight Number *</Label>
          <Input
            id="flightNumber"
            placeholder="e.g., DL123"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* From and To */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2" ref={fromRef}>
          <Label htmlFor="from">From *</Label>
          <div className="relative">
            <Input
              id="from"
              placeholder="e.g., JFK, New York"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onFocus={() => setShowFromSuggestions(true)}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {fromSuggestions.map((airport) => (
                  <div
                    key={airport.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    onClick={() => handleFromSelect(airport)}
                  >
                    <div className="font-medium">
                      {airport.iata && <span className="font-bold">{airport.iata}</span>} {airport.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {airport.city}, {airport.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2" ref={toRef}>
          <Label htmlFor="to">To *</Label>
          <div className="relative">
            <Input
              id="to"
              placeholder="e.g., LAX, Los Angeles"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => setShowToSuggestions(true)}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {toSuggestions.map((airport) => (
                  <div
                    key={airport.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    onClick={() => handleToSelect(airport)}
                  >
                    <div className="font-medium">
                      {airport.iata && <span className="font-bold">{airport.iata}</span>} {airport.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {airport.city}, {airport.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Pickers - Departure and Arrival */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Departure Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="departureDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDate ? departureDate.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="arrivalDate">Arrival Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="arrivalDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !arrivalDate && "text-muted-foreground"
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {arrivalDate ? arrivalDate.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={arrivalDate}
                onSelect={setArrivalDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Flight Times */}
      <div className="space-y-2">
        <Label>Flight Times (UTC) *</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 ">
            <Label htmlFor="departureTime" className="text-xs text-gray-500 dark:text-gray-400">
              Departure Time
            </Label>
            <TimePicker
              id="departureTime"
              value={departureTime}
              onChange={(time) => setDepartureTime(time)}
              placeholder="Select time"
              allowClear={true}
              format="HH:mm"
              disabled={isSubmitting}
              className="w-full"
              popupClassName="time-picker-dropdown"
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arrivalTime" className="text-xs text-gray-500 dark:text-gray-400">
              Arrival Time
            </Label>
            <TimePicker
              id="arrivalTime"
              value={arrivalTime}
              onChange={(time) => setArrivalTime(time)}
              placeholder="Select time"
              allowClear={true}
              format="HH:mm"
              disabled={isSubmitting}
              className="w-full"
              popupClassName="time-picker-dropdown"
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
