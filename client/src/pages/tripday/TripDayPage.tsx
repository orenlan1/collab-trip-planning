import { IoAdd } from "react-icons/io5";
import { ActivityCard } from "./components/ActivityCard";
import { useEffect, useState } from "react";
import { tripDaysApi } from "./services/api";
import AddActivityDialog from "./components/AddActivityDialog";
import { useTripDayStore } from "@/stores/tripDayStore";
import { ChooseActivityTypeDialog } from "./components/ChooseActivityTypeDialog";
import AddDiningActivityDialog from "./components/AddDiningActivityDialog";
import { GoogleMaps } from "@/components/GoogleMaps";
import { useTripStore } from "@/stores/tripStore";

interface TripDayPageProps {
    id: string;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const TripDayPage = ({ id }: TripDayPageProps) => {
    const [showChooseActivityDialog, setShowChooseActivityDialog] = useState(false);
    const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
    const [showAddDiningActivityDialog, setShowAddDiningActivityDialog] = useState(false);
    const { tripDay, setTripDay, addActivity } = useTripDayStore();
    const { latitude, longitude } = useTripStore();

    useEffect(() => {
        const fetchTripDayData = async () => {
            try {
                const response = await tripDaysApi.getTripDay(id);
                const date = new Date(response.data.date);
                date.setHours(0,0,0,0);
                console.log("Fetched trip day data:", response.data);
                setTripDay({...response.data, date});
                
            } catch (error) {
                console.error("Failed to fetch trip day data:", error);
            }
        };

        fetchTripDayData();   
    }, [id]);

    const handleActivityTypeSelected = (type: string) => {
        if (type === 'ACTIVITIES') {
            setShowAddActivityDialog(true);
        }
        else if (type === 'DINING') {
            setShowAddDiningActivityDialog(true);
        }
        // Other types will be implemented later
    };

    const handleCreateActivity = async (placeName: string, address: string, latitude?: number, longitude?: number) => {
        try {
            const response = await tripDaysApi.addNewActivity(id, { 
                name: placeName, 
                address,
                latitude,
                longitude
            });
            addActivity(response.data);
            setShowAddActivityDialog(false);
            
        } catch (error) {
            console.error("Failed to add activity:", error);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="text-md font-semibold p-4">
                  {tripDay?.date && (<>  <h2>Day Itinerary - {tripDay?.date.getDate()} {monthNames[tripDay?.date.getMonth()]}, {tripDay?.date.getFullYear()}</h2></>)}
                </div>
                <div>
                    <button 
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
                        onClick={() => setShowChooseActivityDialog(true)}
                    >
                        New Activity
                    </button>
                </div>
            </div>
            <hr />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div className="flex flex-col gap-6 order-first md:order-last">
                    <div className="border-2 border-gray-300 my-4 p-4 bg-white/80 dark:bg-slate-800 rounded-lg h-fit">
                        <h2 className="text-lg font-medium mb-4">Day Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Planned Activities:</span>
                                <span className="font-semibold">{tripDay?.activities.length || 0}</span>
                            </div>
                        </div>
                    </div>    

                    
                    <div className="border-2 dark:bg-slate-800 border-gray-300 p-4 rounded-lg h-fit">
                        <h2 className="text-lg font-medium mb-4">Map Overview</h2>    
                        <div className="w-full h-64 rounded-md overflow-hidden">
                            <GoogleMaps 
                                center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                                markers={tripDay?.activities.map(activity => ({
                                    lat: activity.latitude || 0,
                                    lng: activity.longitude || 0
                                })) || []}
                            />
                        </div>
                    </div>
                        
                    

                </div>

                <div className="md:col-span-2">
                    {tripDay?.activities.map((activity) => (
                        <ActivityCard 
                            key={activity.id} 
                            activity={activity} 
                            date={tripDay.date} 
                        />
                    ))}
                    <div className="border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="bg-gray-200 p-3 rounded-full mb-3">
                            <IoAdd className="text-2xl text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium">Add New Activity</h3>
                        <p className="text-gray-500 text-sm text-center mt-1">Create another activity for this day</p>
                        <button 
                            className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
                            onClick={() => setShowChooseActivityDialog(true)}
                        >
                            Create Activity
                        </button>
                    </div>
                </div>
            
            </div>

            
            <ChooseActivityTypeDialog
                open={showChooseActivityDialog}
                onOpenChange={setShowChooseActivityDialog}
                onActivityTypeSelected={handleActivityTypeSelected}
            />

            <AddActivityDialog
                isOpen={showAddActivityDialog}
                onOpenChange={setShowAddActivityDialog}
                onSubmit={handleCreateActivity}
            />

            <AddDiningActivityDialog
                isOpen={showAddDiningActivityDialog}
                onOpenChange={setShowAddDiningActivityDialog}
                onSubmit={handleCreateActivity}
            />
        </div>
    );
};
