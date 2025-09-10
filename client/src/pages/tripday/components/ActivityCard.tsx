import { GrLocationPin } from "react-icons/gr";
import {  IoLocationOutline } from "react-icons/io5";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { useCallback } from "react";
import { tripDaysApi } from "../services/api";
import { AutoSaveInputStatusRender } from "@/components/AutoSaveInputStatusRender";

interface ActivityCardProps {
  activity?: {
    id?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    name?: string;
    address?: string;
    image?: string;
  };
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const displayActivity = activity || {
    id: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    name: "",
    address: "",
    image: null,
  };

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
          <div className="pl-4 pr-4 pt-4 border-gray-200 flex items-center">
            <h1 className="text-lg font-semibold">{displayActivity.name}</h1>
            <div className="ml-2">
              <AutoSaveInputStatusRender hasUnsavedChanges={hasUnsavedChanges} saveState={saveState} />
            </div>
          </div>
          <div className="pt-4 pr-4 pb-4 mr-4">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add any important notes" className="p-4 w-full" />
          </div>
          <div className="px-4 pb-4 flex items-center text-sm text-gray-600">
            <GrLocationPin className="text-gray-500 " />
            <span className="ml-1">{displayActivity.address || "No address provided"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
