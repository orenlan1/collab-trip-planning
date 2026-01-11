import { IoAdd } from "react-icons/io5";
import { ActivityCard } from "./components/ActivityCard";
import { useEffect, useState } from "react";
import { tripDaysApi } from "./services/api";
import AddActivityDialog from "./components/AddActivityDialog";
import { useTripDayStore } from "@/stores/tripDayStore";
import { ChooseActivityTypeDialog } from "./components/ChooseActivityTypeDialog";
import AddDiningActivityDialog from "./components/AddDiningActivityDialog";
import { useTripStore } from "@/stores/tripStore";
import { useActivitySocketListeners } from "./hooks/useActivitySocketListeners";
import type { CreateActivityRequest } from "@/types/activity";

interface TripDayPageProps {
    id: string;
    onActivityHover?: (activityId: string) => void;
    onActivityLeave?: () => void;
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const TripDayPage = ({ id, onActivityHover, onActivityLeave }: TripDayPageProps) => {
    const [showChooseActivityDialog, setShowChooseActivityDialog] = useState(false);
    const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
    const [showAddDiningActivityDialog, setShowAddDiningActivityDialog] = useState(false);
    const { tripDay, setTripDay, addActivity } = useTripDayStore();
    const tripId = useTripStore(state => state.id);

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
    };

    const handleCreateActivity = async (activity : CreateActivityRequest) => {
        try {
            const response = await tripDaysApi.addNewActivity(tripId, id, activity);
            addActivity(response.data);
            // Dialog will be closed by the child component
        } catch (error) {
            console.error("Failed to add activity:", error);
            throw error; // Re-throw to let the dialog handle the error
        }
    };


    return (
        <div className="p-4">
            <div className="mb-4 flex justify-end">
                <button 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md"
                    onClick={() => setShowChooseActivityDialog(true)}
                >
                    New Activity
                </button>
            </div>

            {tripDay?.activities.map((activity, _idx, arr) => {
                const activitiesWithTime = arr.filter(a => a.startTime);
                const indexInTimed = activitiesWithTime.findIndex(a => a.id === activity.id);
                return (
                    <ActivityCard 
                        key={activity.id} 
                        activity={activity} 
                        date={tripDay.date} 
                        index={indexInTimed + 1}
                        onHover={onActivityHover}
                        onLeave={onActivityLeave}
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
                tripId={tripId}
                destination={useTripStore.getState().destination || ''}
            />
        </div>
    );
};
