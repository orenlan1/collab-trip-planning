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
import { useActivitySocketListeners } from "./hooks/useActivitySocketListeners";

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
    const tripId = useTripStore(state => state.id);
    const latitude = useTripStore(state => state.latitude);
    const longitude = useTripStore(state => state.longitude);
    const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

    const { animatedActivityIds } = useActivitySocketListeners(id);

    useEffect(() => {
        const fetchTripDayData = async () => {
            try {
                const response = await tripDaysApi.getTripDay(tripId, id);
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

    const handleActivityHover = (activityId: string) => {
        setHoveredActivityId(activityId);
    };

    const handleActivityLeave = () => {
        setHoveredActivityId(null);
    };

    const handleCreateActivity = async (placeName: string, address: string, latitude?: number, longitude?: number) => {
        try {
            const response = await tripDaysApi.addNewActivity(tripId, id, { 
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
                <div className="text-lg font-semibold p-4">
                  {tripDay?.date && (<>  <h2>{tripDay?.date.getDate()} {monthNames[tripDay?.date.getMonth()]}, {tripDay?.date.getFullYear()}</h2></>)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-4">
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
                        <div className="w-full h-full rounded-md overflow-hidden">
                            <GoogleMaps 
                                center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
                                markers={tripDay?.activities.map((activity, _idx, arr) => {
                                    const activitiesWithTime = arr.filter(a => a.startTime);
                                    const indexInTimed = activitiesWithTime.findIndex(a => a.id === activity.id);
                                    return {
                                        id: activity.id,
                                        lat: activity.latitude || 0,
                                        lng: activity.longitude || 0,
                                        index: indexInTimed + 1,
                                        hasTime: !!activity.startTime
                                    };
                                }) || []}
                                hoveredMarkerId={hoveredActivityId || undefined}
                            />
                        </div>
                    </div>
                        
                    

                </div>

                <div className="md:col-span-2">
                    {tripDay?.activities.map((activity, _idx, arr) => {
                        const activitiesWithTime = arr.filter(a => a.startTime);
                        const indexInTimed = activitiesWithTime.findIndex(a => a.id === activity.id);
                        return (
                            <ActivityCard 
                                key={activity.id} 
                                activity={activity} 
                                date={tripDay.date} 
                                index={indexInTimed + 1}
                                onHover={handleActivityHover}
                                onLeave={handleActivityLeave}
                                isAnimated={animatedActivityIds.has(activity.id)}
                            />
                        );
                    })}
                    <div 
                        onClick={() => setShowChooseActivityDialog(true)} 
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-all"
                    >
                        <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-full mb-3">
                            <IoAdd className="text-2xl text-slate-500 dark:text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium">Add New Activity</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">Create another activity for this day</p>
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
