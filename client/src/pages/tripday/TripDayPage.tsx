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
import { Sparkles } from "lucide-react";
import { ItineraryFlightCard } from "./components/ItineraryFlightCard";

interface TripDayPageProps {
    id: string;
    onActivityHover?: (activityId: string) => void;
    onActivityLeave?: () => void;
    onGenerateWithAI?: () => void;
}


export const TripDayPage = ({ id, onActivityHover, onActivityLeave, onGenerateWithAI }: TripDayPageProps) => {
    const [showChooseActivityDialog, setShowChooseActivityDialog] = useState(false);
    const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
    const [showAddDiningActivityDialog, setShowAddDiningActivityDialog] = useState(false);
    const { tripDay, setTripDay, addActivity } = useTripDayStore();
    const tripId = useTripStore(state => state.id);
    const flights = useTripStore(state => state.flights);

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


    const dayFlights = tripDay
        ? flights.filter(f => {
            const d = tripDay.date;
            const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return f.departure.split("T")[0] === dayStr;
          })
        : [];

    const isEmpty = tripDay !== null && tripDay.activities.length === 0;

    return (
        <div className="p-4">
            {dayFlights.map(flight => (
                <ItineraryFlightCard key={flight.id} flight={flight} />
            ))}

            {isEmpty && onGenerateWithAI ? (
                <div className="mb-6 rounded-2xl bg-linear-to-br from-primary/10 to-violet-500/10 border border-primary/20 p-6 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                        <Sparkles size={22} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">No activities planned yet</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Let AI plan activities for all your trip days based on your preferences</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Any activities you've already saved will not be affected.</p>
                    </div>
                    <button
                        onClick={onGenerateWithAI}
                        className="flex items-center gap-2 bg-linear-to-r from-primary to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Sparkles size={14} />
                        Generate with AI
                    </button>
                    <button
                        onClick={() => setShowChooseActivityDialog(true)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        or add manually
                    </button>
                </div>
            ) : (
                <div className="mb-4 flex justify-end">
                    <button
                        className="bg-linear-to-r from-primary to-violet-500 hover:shadow-md hover:-translate-y-0.5 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200"
                        onClick={() => setShowChooseActivityDialog(true)}
                    >
                        New Activity
                    </button>
                </div>
            )}

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
                className="border-2 border-dashed border-border/60 flex flex-col items-center justify-center p-6 rounded-xl hover:border-primary/40 hover:text-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
            >
                <div className="bg-secondary p-3 rounded-full mb-3 group-hover:bg-primary/10 transition-colors">
                    <IoAdd className="text-2xl text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-medium">Add New Activity</h3>
                <p className="text-muted-foreground text-sm text-center mt-1">Create another activity for this day</p>
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
