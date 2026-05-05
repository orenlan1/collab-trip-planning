import { GrLocationPin } from "react-icons/gr";
import { MdAccessTimeFilled } from "react-icons/md";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { useCallback, useState } from "react";
import { tripDaysApi } from "../services/api";
import { AutoSaveInputStatusRender } from "@/components/AutoSaveInputStatusRender";
import { FaTrash } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import type { Activity } from "@/types/activity";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeSetter } from "./TimeSetter";
import { useTripDayStore } from "@/stores/tripDayStore";
import { AddExpenseDialog } from "@/pages/budget/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/pages/budget/components/EditExpenseDialog";
import type { Expense } from "@/types/expense"; 
import { useParams } from "react-router-dom";
import { budgetApi } from '../../budget/services/budgetApi';
import type { CreateExpenseInput } from '../../budget/types/budget';
import { toast } from "react-toastify";
import { formatCurrencyAmount } from "@/lib/currency";

interface ActivityCardProps {
  activity: Activity;
  date: Date;
  index?: number;
  onHover?: (activityId: string) => void;
  onLeave?: () => void;
  isAnimated?: boolean;
}

export const ActivityCard = ({ activity, date, index, onHover, onLeave, isAnimated }: ActivityCardProps) => {
  const { tripId } = useParams<{ tripId: string }>();
  const updateActivity = useTripDayStore(state => state.updateActivity);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);

  // Helper function to display time range from backend-formatted ISO strings
  const formatTimeDisplay = (startTime?: string, endTime?: string): string => {
    if (!startTime) return "Add time";
    
    // Backend sends "2025-09-12T07:00:00" (no milliseconds, no Z)
    // Extract time: "07:00:00" -> "7:00"
    const startTimePart = startTime.split('T')[1]; // "07:00:00"
    const [hours, minutes] = startTimePart.split(':');
    const formattedStart = `${parseInt(hours, 10)}:${minutes}`;
    
    if (endTime) {
      const endTimePart = endTime.split('T')[1];
      const [endHours, endMinutes] = endTimePart.split(':');
      const formattedEnd = `${parseInt(endHours, 10)}:${endMinutes}`;
      return `${formattedStart} - ${formattedEnd}`;
    }
    
    return formattedStart;
  };

  const handleTimeSave = async (startTime?: string | null, endTime?: string | null) => {
    if (!tripId) return;
    console.log("Saving time:", startTime, endTime);
    const response = await tripDaysApi.updateActivity(tripId, activity.id!, { startTime, endTime });
    
    console.log("Time updated:", response.data);
    
    // Update the store with the response data
    updateActivity(activity.id, response.data);
    setPopoverOpen(false);
  }

  const saveDescription = useCallback(async (description: string) => {
    if (!activity.id || !tripId) throw new Error('Activity ID and Trip ID are required');
    
    const response = await tripDaysApi.updateActivity(tripId, activity.id, { description });
    updateActivity(activity.id, response.data);
  }, [activity.id, tripId, updateActivity]);

  const {value : description,
     updateValue: setDescription,
     saveState,
     hasUnsavedChanges
  } = useAutoSaveInput({
    saveFunction: saveDescription,
    debounceMs: 1000,
    savedDisplayMs: 1000,
    minSavingMs: 500,
    initialValue: activity.description || "",
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [description]);

  const removeActivity = useTripDayStore(state => state.removeActivity);
  
  const handleDeleteActivity = async () => {
  try {
    if (!tripId) return;
    await tripDaysApi.deleteActivity(tripId, activity.id);
    removeActivity(activity.id); 
  } catch (error) {
    console.error('Failed to delete activity:', error);
  }
};

  const handleAddExpense = async (input: CreateExpenseInput) => {
    if (!tripId) return;

    // Format tripDay date as YYYY-MM-DD in local time (date is the tripDay date prop)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const response = await budgetApi.addExpense(tripId, {
      ...input,
      activityId: activity.id,
      date: dateString
    });
    const expense = response.data;
    toast.success('Expense added successfully!');

    // Update activity in store to include the new expense
    const updatedActivity: Activity = { ...activity, expense: expense as Activity['expense'] };
    updateActivity(activity.id!, updatedActivity);
  };

  const handleEditExpense = async (expenseId: string, input: CreateExpenseInput) => {
    if (!tripId) return;
    
    const response = await budgetApi.updateExpense(tripId, expenseId, input);
    const expense = response.data;
    toast.success('Expense updated successfully!');

    const updatedActivity: Activity = { ...activity, expense: expense as Activity['expense'] };
    updateActivity(activity.id!, updatedActivity);
  };

  const handleOnActivityHover = () => {
    if (onHover && activity.latitude && activity.longitude) {
      onHover(activity.id);
    }
  };

  const handleOnActivityLeave = () => {
    if (onLeave) {
      onLeave();
    }
  };

  return (
    <div className="flex items-start gap-6 my-4">
      {/* Timeline */}
      <div className="flex flex-col items-center min-w-[60px]">
        {activity.startTime ? (
          <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {formatTimeDisplay(activity.startTime, activity.endTime)}
            </div>
            <div className="w-8 h-8 bg-linear-to-br from-primary to-violet-500 rounded-full flex items-center justify-center shadow-md border-2 border-background">
              <span className="text-white font-bold text-sm">{index}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-muted-foreground/60 mb-2">
              Add time
            </div>
            <div className="w-6 h-6 bg-border rounded-full flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 bg-background rounded-full"></div>
            </div>
          </div>
        )}
        <div className="w-0.5 h-24 bg-border/70 mt-3"></div>
      </div>

      {/* Activity Card */}
      <div onMouseEnter={handleOnActivityHover} onMouseLeave={handleOnActivityLeave} className="flex-1">
        <div className={`border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-card ${isAnimated ? 'animate-pulse-border' : ''}`}>
          {/* Top: image | name+status+description | trash */}
          <div className="flex flex-col">
            <div className="flex items-start gap-4 p-4">
              {activity.image && (
                <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={activity.image}
                    alt={"Place Picture"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-lg font-semibold">{activity.name}</h1>
                    <div className="mt-1">
                      <AutoSaveInputStatusRender hasUnsavedChanges={hasUnsavedChanges} saveState={saveState} />
                    </div>
                  </div>

                  <div className="ml-4">
                    <FaTrash onClick={handleDeleteActivity} className="text-slate-400 hover:text-red-500 cursor-pointer" />
                  </div>
                </div>

                <div className="mt-3">
                  <textarea
                    ref={textareaRef}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any important notes"
                    className="p-3 w-full resize-none rounded-md bg-transparent border-2 border-border focus:border-primary/60 focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors overflow-hidden"
                    rows={1}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: time and location */}
            <div className="border-t border-border/50 bg-secondary/30 px-4 py-3 flex gap-4 items-center text-sm text-foreground font-medium">

              <div className="flex items-center hover:text-foreground cursor-pointer transition-colors">
                <FaMoneyBillWave className="text-green-600 hover:text-green-700" />
                {activity.expense ? (
                  <span 
                    className="ml-2 font-semibold text-foreground hover:text-primary cursor-pointer transition-colors"
                    onClick={() => setShowEditExpenseDialog(true)}
                  >
                    {formatCurrencyAmount(activity.expense.cost, activity.expense.currency)}
                  </span>
                ) : (
                  <button className="ml-2 text-sm  cursor-pointer" onClick={() => setShowAddExpenseDialog(true)}>
                    Add cost
                  </button>
                )}
              </div>
              
              <AddExpenseDialog
                open={showAddExpenseDialog}
                activity={activity}
                onOpenChange={setShowAddExpenseDialog}
                onSubmit={handleAddExpense}
              />

              <EditExpenseDialog
                open={showEditExpenseDialog}
                expense={activity.expense as Expense | null}
                onOpenChange={setShowEditExpenseDialog}
                onSubmit={handleEditExpense}
              />

              <div className="flex items-center hover:text-primary cursor-pointer transition-colors">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center">
                      <MdAccessTimeFilled className="hover:text-slate-800 dark:hover:text-slate-200" />
                      <span className="ml-1">
                        {formatTimeDisplay(activity.startTime, activity.endTime)}
                      </span>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side='bottom' align='start' className='w-auto p-0'>
                    <TimeSetter
                      date={date}
                      onTimeSave={handleTimeSave}
                      startTime={activity.startTime}
                      endTime={activity.endTime}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center">
                <GrLocationPin className="text-gray-500" />
                <span className="ml-1">{activity.address || "No address provided"}</span>
              </div>

            </div>

            {/* Suggestion pills for experiential activities */}
            {activity.suggestions && activity.suggestions.length > 0 && (
              <div className="px-4 pb-3 pt-2 flex flex-wrap gap-1.5">
                {activity.suggestions.map((s, i) =>
                  s.url ? (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/6 px-2 py-0.5 rounded-full border border-primary/20 transition-colors"
                    >
                      {s.name}
                      <ExternalLink size={9} />
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full"
                    >
                      {s.name}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
