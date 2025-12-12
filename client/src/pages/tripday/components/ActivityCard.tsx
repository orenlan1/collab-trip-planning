import { GrLocationPin } from "react-icons/gr";
import { MdAccessTimeFilled } from "react-icons/md";
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
import type { ExpenseCategory } from '../../budget/types/budget';
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

  const handleAddExpense = async (description: string, cost: number, category: ExpenseCategory, _activityId?: string, currency?: string) => {
    if (!tripId) return;

    // Format tripDay date as YYYY-MM-DD in local time (date is the tripDay date prop)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    try {
      const response = await budgetApi.addExpense(tripId, { description, cost, category, activityId: activity.id, currency, date: dateString });
      const expense = response.data;
      toast.success('Expense added successfully!');

      // Update activity in store to include the new expense
      const updatedActivity = { ...activity, expense } as any;
      updateActivity(activity.id!, updatedActivity);
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditExpense = async (expenseId: string, description: string, cost: number, category: ExpenseCategory, currency?: string, date?: string) => {
    if (!tripId) return;
    
    try {
      const response = await budgetApi.updateExpense(tripId, expenseId, { description, cost, category, currency, date });
      const expense = response.data;
      toast.success('Expense updated successfully!');

      const updatedActivity = { ...activity, expense } as any;
      updateActivity(activity.id!, updatedActivity);
    } catch (error: any) {
      throw error;
    }
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
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              {formatTimeDisplay(activity.startTime, activity.endTime)}
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
              <span className="text-white font-bold text-sm">{index}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-gray-400 mb-2">
              Add time
            </div>
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
        <div className="w-0.5 h-24 bg-gray-300 dark:bg-gray-600 mt-3"></div>
      </div>

      {/* Activity Card */}
      <div onMouseEnter={handleOnActivityHover} onMouseLeave={handleOnActivityLeave} className="flex-1">
        <div className={`border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-200 bg-white dark:bg-slate-800 ${isAnimated ? 'animate-pulse-border' : ''}`}>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any important notes"
                    className="p-3 w-full resize-none rounded-md bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-neutral-300 focus:ring-0 text-slate-900 dark:text-slate-300 placeholder:text-slate-500 dark:placeholder:text-slate-300"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: time and location */}
            <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3 flex gap-4 items-center text-sm text-slate-700 dark:text-slate-300 font-semibold">

              <div className="flex items-center dark:hover:text-slate-200 hover:text-slate-800 cursor-pointer">
                <FaMoneyBillWave className="text-green-600 hover:text-green-700" />
                {activity.expense ? (
                  <span 
                    className="ml-2 font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-800 cursor-pointer"
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

              <div className="flex items-center hover:text-slate-800 cursor-pointer dark:hover:text-slate-200">
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
          </div>
        </div>
      </div>
    </div>
  );
}
