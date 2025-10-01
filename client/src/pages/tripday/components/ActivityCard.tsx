import { GrLocationPin } from "react-icons/gr";
import { MdAccessTimeFilled } from "react-icons/md";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { useCallback, useState } from "react";
import { tripDaysApi } from "../services/api";
import { AutoSaveInputStatusRender } from "@/components/AutoSaveInputStatusRender";
import { FaTrash } from "react-icons/fa";
import type { Activity } from "@/types/activity";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeSetter } from "./TimeSetter";
import { useTripDayStore } from "@/stores/tripDayStore";

interface ActivityCardProps {
  activity: Activity;
  date: Date;
}

export const ActivityCard = ({ activity, date }: ActivityCardProps) => {
  const [displayActivity, setDisplayActivity] = useState<Activity>(activity);

  // Helper function to format time from ISO string to HH:MM (exact time, no timezone conversion)
  const formatTimeFromISO = (isoString: string): string => {
    // Extract time directly from ISO string: "2025-09-12T07:00:00.000Z" -> "7:00"
    const timePart = isoString.split('T')[1].split('.')[0]; // Gets "07:00:00"
    const [hours, minutes] = timePart.split(':');
    const hour24 = parseInt(hours, 10);
    const formattedHour = hour24.toString(); // Remove leading zero: "07" -> "7"
    return `${formattedHour}:${minutes}`;
  };

  // Helper function to display time range
  const formatTimeDisplay = (startTime?: string, endTime?: string): string => {
    if (!startTime) return "Add time";
    
    const formattedStart = formatTimeFromISO(startTime);
    
    if (endTime) {
      const formattedEnd = formatTimeFromISO(endTime);
      return `${formattedStart} - ${formattedEnd}`;
    }
    
    return formattedStart;
  };

  const handleTimeSave = async (startTime?: string | null, endTime?: string | null) => {

    console.log("Saving time:", startTime, endTime);
    const response = await tripDaysApi.updateActivity(displayActivity.id!, { startTime, endTime });
    
    console.log("Time updated:", response.data);
    
    // Update the local state with the response data
    setDisplayActivity(response.data,);
  }

  const saveDescription = useCallback(async (description: string) => {
    if (!displayActivity.id) throw new Error('Activity ID is required');
    
    await tripDaysApi.updateActivity(displayActivity.id, { description });
  }, [displayActivity.id]);

  const {value : description,
     updateValue: setDescription,
     saveState,
     error,
     hasUnsavedChanges   
  } = useAutoSaveInput({
    saveFunction: saveDescription,
    debounceMs: 1000,
    savedDisplayMs: 1000,
    minSavingMs: 500,
    initialValue: displayActivity.description || "",
  });

  const removeActivity = useTripDayStore(state => state.removeActivity);
  
  const handleDeleteActivity = async () => {
  try {
    await tripDaysApi.deleteActivity(displayActivity.id);
    removeActivity(displayActivity.id); 
  } catch (error) {
    console.error('Failed to delete activity:', error);
  }
};



  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white my-4">
      <div className="flex">
        {displayActivity.image && (
          <div className="w-28 h-28 m-4 flex-shrink-0 ">
            <img
              src={displayActivity.image}
              alt={"Place Picture"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="flex-grow">
          <div className="pl-4 pr-4 pt-4 border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold inline-block">{displayActivity.name}</h1>
              <div className="ml-2 inline-block">
                <AutoSaveInputStatusRender hasUnsavedChanges={hasUnsavedChanges} saveState={saveState} />
              </div>
            </div>
            <div>
                <FaTrash onClick={handleDeleteActivity} className="text-slate-400 hover:text-red-500 cursor-pointer" />
            </div>
          </div>
          <div className="pt-4 pr-4 pb-4 mr-4">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add any important notes" className="p-4 w-full" />
          </div>
          <div className="px-4 pb-4 flex gap-4 items-center text-sm text-slate-500 font-semibold">
            <div className="flex items-center hover:text-slate-800 cursor-pointer">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center">
                    <MdAccessTimeFilled className="hover:text-slate-800" />
                    <span className="ml-1">
                      {formatTimeDisplay(displayActivity.startTime, displayActivity.endTime)}
                    </span>
                  </div>
                </PopoverTrigger>
                <PopoverContent side='bottom' align='start' className='w-auto p-0'>
                  <TimeSetter date={date} onTimeSave={handleTimeSave} startTime={displayActivity.startTime} endTime={displayActivity.endTime} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center">
              <GrLocationPin className="text-gray-500 " />
              <span className="ml-1">{displayActivity.address || "No address provided"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
