
import {  IoLocationOutline } from "react-icons/io5";

interface ActivityCardProps {
  activity?: {
    id?: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    image?: string;
  };
  isEditable?: boolean;
}

export const ActivityCard = ({ activity, isEditable = false }: ActivityCardProps) => {
  // Default empty activity if none provided
  const displayActivity = activity || {
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: ""
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
        <div className="relative flex items-center gap-2 p-2 border-b border-gray-300">
            <IoLocationOutline className="absolute left-2 top-1/2 transform -translate-y-1/2" />
            <input type="text" value={displayActivity.location} placeholder="Add place" className="border-b border-gray-300 p-2 ml-4 w-full" />

        </div>
    </div>
  );
}
