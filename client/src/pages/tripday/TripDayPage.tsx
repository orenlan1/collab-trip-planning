import { IoAdd } from "react-icons/io5";
import type { TripDay } from "./services/api";
import { ActivityCard } from "./components/ActivityCard";
import { useState } from "react";
import { tripDaysApi } from "./services/api";
import CreateActivityModal from "./components/CreateActivityModal";
import { useItineraryStore } from "@/stores/itineraryStore";


interface TripDayPageProps {
    day: TripDay;  
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const TripDayPage = ({ day }: TripDayPageProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { addActivity, days, selectedDayId } = useItineraryStore();
    
    const currentDay = days.find(d => d.id === selectedDayId) || day;
    const date = new Date(currentDay.date);
    const activities = currentDay.activities || [];

    const handleCreateActivity = async (placeName: string, address: string) => {
        try {
            const response = await tripDaysApi.addNewActivity(currentDay.id, { name: placeName, address });
            console.log("Activity added for place:", placeName, response);
            addActivity(currentDay.id, response.data);
            setIsModalOpen(false);
            
        } catch (error) {
            console.error("Failed to add activity:", error);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="text-md font-semibold p-4">
                    <h2>Day Itinerary - {date.getDate()} {monthNames[date.getMonth()]}, {date.getFullYear()}</h2>
                </div>
                <div>
                    <button 
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
                        onClick={() => setIsModalOpen(true)}
                    >
                        New Activity
                    </button>
                </div>
            </div>
            <hr />

            <div className="grid grid-cols-3 gap-4 p-4">
                <div className="col-span-2">
                    {activities.map(activity => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                    <div className="border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="bg-gray-200 p-3 rounded-full mb-3">
                            <IoAdd className="text-2xl text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium">Add New Activity</h3>
                        <p className="text-gray-500 text-sm text-center mt-1">Create another activity for this day</p>
                        <button 
                            className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Create Activity
                        </button>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="border-2 border-gray-300 p-4 rounded-lg">
                        <h2 className="text-lg font-medium">Day Summary</h2>
                    </div>     
                </div>
            
            </div>
            
            <CreateActivityModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleCreateActivity}
            />
        </div>
    );
};
