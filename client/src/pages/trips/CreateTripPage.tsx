import { useForm } from "react-hook-form";
import { FiMapPin } from "react-icons/fi";
import { BsCalendar4 } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { dateToLocalDateString } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tripsApi } from "./services/api";
import { useNavigate } from "react-router-dom";
import { destinationsApi, type Destination } from "./services/destinations-api";
import { useDebounce } from "@/hooks/useDebounce";

export interface CreateTripRequest {
    title: string;
    destination: string;
    description?: string;
    startDate?: string; // string format for API
    endDate?: string;   // string format for API
}

export const CreateTripPage = () => {

    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [dateError, setDateError] = useState<string>("");
    const [destinationError, setDestinationError] = useState<string>("");
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateTripRequest>();

    // Destination autocomplete
    const [destination, setDestination] = useState('');
    const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
    const [destinationSuggestions, setDestinationSuggestions] = useState<Destination[]>([]);
    const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
    const destinationRef = useRef<HTMLDivElement>(null);
    const debouncedDestination = useDebounce(destination, 300);

    // Search destinations
    useEffect(() => {
      if (debouncedDestination.length >= 2) {
        destinationsApi.search(debouncedDestination)
          .then(res => setDestinationSuggestions(res.data))
          .catch(err => console.error('Failed to search destinations:', err));
      } else {
        setDestinationSuggestions([]);
      }
    }, [debouncedDestination]);

    // Click outside handler
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
          setShowDestinationSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDestinationSelect = (dest: Destination) => {
      const displayText = dest.type === 'city' 
        ? `${dest.name}, ${dest.country}`
        : dest.name;
      setDestination(displayText);
      setSelectedDestination(displayText);
      setValue('destination', displayText);
      setShowDestinationSuggestions(false);
      setDestinationError("");
    };

    const handleDestinationChange = (value: string) => {
      setDestination(value);
      if (selectedDestination && value !== selectedDestination) {
        setSelectedDestination(null);
        setValue('destination', '');
      }
    };

  const onSubmit = async (data: CreateTripRequest) => {
    if (!selectedDestination) {
      setDestinationError("Please select a destination from the suggestions");
      return;
    }

    // Validate that both dates are provided or both are empty
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setDateError("Both start and end dates must be provided together, or leave both empty for an open-ended trip.");
      return;
    }
    
    // Clear any previous errors
    setDateError("");
    setDestinationError("");
    
    // Set destination from selected value
    data.destination = selectedDestination;
    
    if (startDate) {
      data.startDate = dateToLocalDateString(startDate);
    }
    if (endDate) {
      data.endDate = dateToLocalDateString(endDate);
    }
    try {
      const response = await tripsApi.create(data);
      console.log("Trip created successfully");
      navigate(`/trips/${response.data.id}/overview`);
    } catch (error) {
      console.error("Error creating trip:", error);
    }
  };

  const inputClass = "w-full focus:outline-none focus:ring-2 focus:ring-ring transition text-sm bg-background text-foreground border border-border rounded-lg py-3 px-4 placeholder:text-muted-foreground";
  const dateInputClass = "w-full focus:outline-none focus:ring-2 focus:ring-ring transition text-sm bg-background text-foreground border border-border rounded-lg py-2 pr-10 pl-10 cursor-pointer placeholder:text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mt-10">
      <div className="flex gap-6 items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Create trip</h1>
          <p className="text-sm text-muted-foreground">Start a new trip. Title and destination are required — everything else is optional and can be updated later.</p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate('/my-trips')}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            form="createTripForm"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition shadow-sm"
          >
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <form id="createTripForm" onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Title <span className="text-destructive">*</span>
              {errors.title && <span className="text-destructive font-normal ml-1">{errors.title.message}</span>}
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              placeholder="e.g., Kyoto Spring Getaway"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-2">This is required to create the trip. You can add more details later.</p>
          </div>

          <div ref={destinationRef}>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Destination <span className="text-destructive">*</span>
              {destinationError && <span className="text-destructive font-normal ml-1">{destinationError}</span>}
            </label>
            <div className="relative">
              <FiMapPin className="absolute top-1/2 left-3 -translate-y-1/2 text-primary" />
              <input
                type="text"
                placeholder="Search and select a destination, city or country"
                className={`w-full focus:outline-none focus:ring-2 transition text-sm bg-background text-foreground border rounded-lg py-3 pr-4 pl-8 placeholder:text-muted-foreground ${
                  destinationError
                    ? 'border-destructive focus:ring-destructive/40'
                    : selectedDestination
                    ? 'border-green-500 focus:ring-green-400/40'
                    : 'border-border focus:ring-ring'
                }`}
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(true)}
                autoComplete="off"
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {destinationSuggestions.map((dest) => (
                    <div
                      key={`${dest.type}-${dest.id}`}
                      className="px-3 py-2 cursor-pointer hover:bg-muted text-sm text-foreground"
                      onClick={() => handleDestinationSelect(dest)}
                    >
                      <div className="font-medium">{dest.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {dest.type === 'city' ? `${dest.country} • City` : 'Country'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedDestination ? '✓ Destination selected' : 'Type to search and select a destination from the list'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
            <textarea
              {...register("description")}
              className={inputClass}
              placeholder="Add notes, purpose, or an overview for this trip — optional"
            />
            <p className="text-xs text-muted-foreground mt-2">Optional. This helps collaborators understand the plan at a glance.</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Fields marked with <span className="text-destructive">*</span> are required. Other fields can be filled now or later.
          </p>
        </form>

        <div className="bg-muted/40 border border-border rounded-lg p-4">
          <div className="flex mb-3 items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Dates</h3>
            <p className="text-xs text-muted-foreground">Optional</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-2">Start date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <BsCalendar4 className="absolute top-1/2 left-3 -translate-y-1/2 text-primary" />
                    <input
                      readOnly
                      placeholder="Pick a date"
                      value={startDate ? format(startDate, "PP") : ""}
                      className={dateInputClass}
                    />
                    {startDate && (
                      <IoClose
                        className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setStartDate(undefined); setDateError(""); }}
                      />
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => { setStartDate(date); setDateError(""); }}
                    disabled={(date) => date < new Date() || (endDate ? date > endDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">End date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer">
                    <BsCalendar4 className="absolute top-1/2 left-3 -translate-y-1/2 text-primary" />
                    <input
                      readOnly
                      placeholder="Pick a date"
                      value={endDate ? format(endDate, "PP") : ""}
                      className={dateInputClass}
                    />
                    {endDate && (
                      <IoClose
                        className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setEndDate(undefined); setDateError(""); }}
                      />
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => { setEndDate(date); setDateError(""); }}
                    disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {dateError && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs text-destructive">{dateError}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Both dates must be provided together, or leave both empty for an open-ended trip. End date must be on or after the start date.
          </p>
        </div>
      </div>
    </div>
  );
};
