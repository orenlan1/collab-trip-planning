import { useForm } from "react-hook-form";
import { FiMapPin } from "react-icons/fi";
import { BsCalendar4 } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { dateToLocalDateString } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { tripsApi } from "./services/api";
import { useNavigate } from "react-router-dom";

export interface CreateTripRequest {
    title: string;
    destination?: string;
    description?: string;
    startDate?: string; // string format for API
    endDate?: string;   // string format for API
}

export const CreateTripPage = () => {

    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [dateError, setDateError] = useState<string>("");
    const { register, handleSubmit, formState: { errors } } = useForm<CreateTripRequest>();


  const onSubmit = async (data: CreateTripRequest) => {
    // Validate that both dates are provided or both are empty
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setDateError("Both start and end dates must be provided together, or leave both empty for an open-ended trip.");
      return;
    }
    
    // Clear any previous date errors
    setDateError("");
    
    if (startDate) {
      // Use consistent date formatting utility
      data.startDate = dateToLocalDateString(startDate);
    }
    if (endDate) {
      // Use consistent date formatting utility  
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

  return (
    <div className="bg-white/80 border-neutral-200/60 border rounded-2xl pt-6 pr-6 pb-6 pl-6 shadow-sm backdrop-blur-sm">
      <div className="flex gap-6 items-start justify-between">
        <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Create trip</h1>
            <p className="text-sm text-slate-600">Start a new trip. Only the title is required - everything else is optional and can be updated later.</p>
        </div>
        <div className="flex gap-3 items-center">
            <button className="hover:bg-slate-200 transition text-slate-900 bg-white/80 border-sky-100 border rounded-md pt-2 pr-3 pb-2 pl-3">
                Cancel
            </button>
            <button form="createTripForm" onClick={handleSubmit(onSubmit)} className=" px-4 py-2 rounded-md bg-indigo-400 hover:bg-indigo-500 text-white font-semibold tracking-tight transition">
                Create
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <form id="createTripForm" onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-5" >
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="">Title <span className="text-rose-500">*</span>{errors.title && <span className="text-rose-500">{errors.title.message}</span>}</label>
                <input {...register("title", { required: "Title is required" })} type="text" placeholder="e.g., Kyoto Spring Getaway" className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-4"/>
                <p className="text-xs text-slate-500 mt-2">This is required to create the trip. You can add more details later.</p>
            </div>
            <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="">Destination</label>
                 <div className="relative">
                    <FiMapPin className="absolute top-1/2 left-3 -translate-y-1/2 text-indigo-500"/>
                    <input {...register("destination")} type="text" placeholder="City, region or country" className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8"/>
                 </div>
                <p className="text-xs text-slate-500 mt-2">Optional. Add a location to help participants know where the trip will take place.</p>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="">Description</label>
                <textarea {...register("description")} className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-4" placeholder="Add notes, purpose, or an overview for this trip - optional"></textarea>
                <p className="text-xs text-slate-500 mt-2">Optional. This helps collaborators understand the plan at a glance</p>
            </div>
            <div className="text-xs text-slate-500">
                Fields marked with <span className="text-rose-500">*</span> are required. Other fields are labeled "Optional" and can be filled now or later.
            </div>

        </form>

        <div className="bg-white/90 border-neutral-200/60 border rounded-lg pt-4 pr-4 pb-4 pl-4">
            <div className="flex mb-3 items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight">Dates</h3>
                <p className="text-xs text-slate-500">Optional</p>
            </div>

            <div className="space-y-3">
                <div>
                    <label htmlFor="" className="block text-xs text-slate-600 mb-2">Start date <span>(optional)</span></label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative cursor-pointer">
                                <BsCalendar4 className="absolute top-1/2 left-3 -translate-y-1/2 text-indigo-500" />
                                <input 
                                    readOnly
                                    placeholder="Pick a date"
                                    value={startDate ? format(startDate, "PP") : ""}
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-2 pr-10 pb-2 pl-10 cursor-pointer" 
                                />
                                {startDate && (
                                    <IoClose
                                        className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-slate-500 hover:text-destructive cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setStartDate(undefined);
                                            setDateError(""); // Clear error when user clears date
                                        }}
                                    />
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    setStartDate(date);
                                    setDateError(""); // Clear error when user selects a date
                                }}
                                disabled={(date) =>
                                    date < new Date() || (endDate ? date > endDate : false)
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label htmlFor="" className="block text-xs text-slate-600 mb-2">End date <span>(optional)</span></label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="relative cursor-pointer">
                                <BsCalendar4 className="absolute top-1/2 left-3 -translate-y-1/2 text-indigo-500" />
                                <input
                                    readOnly
                                    placeholder="Pick a date"
                                    value={endDate ? format(endDate, "PP") : ""}
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-2 pr-10 pb-2 pl-10 cursor-pointer"
                                />
                                {endDate && (
                                    <IoClose
                                        className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-slate-500 hover:text-destructive cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEndDate(undefined);
                                            setDateError(""); // Clear error when user clears date
                                        }}
                                    />
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                    setEndDate(date);
                                    setDateError(""); // Clear error when user selects a date
                                }}
                                disabled={(date) =>
                                    date < new Date() || (startDate ? date < startDate : false)
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            {dateError && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                    <p className="text-xs text-rose-600">{dateError}</p>
                </div>
            )}
            
            <p className="text-xs text-slate-500 mt-3">Both start and end dates must be provided together, or leave both empty to make the trip open-ended. End date must be the same or after the start date.</p>
            


        </div>
    
      </div>
      
     
    </div>
  );
};
