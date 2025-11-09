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
import { useParams } from "react-router-dom";
import { budgetApi } from '../../budget/services/budgetApi';
import type { ExpenseCategory } from '../../budget/types/budget';
import { toast } from "react-toastify";

interface ActivityCardProps {
  activity: Activity;
  date: Date;
}

export const ActivityCard = ({ activity, date }: ActivityCardProps) => {
  const { tripId } = useParams<{ tripId: string }>();
  const updateActivity = useTripDayStore(state => state.updateActivity);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);

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
    const response = await tripDaysApi.updateActivity(activity.id!, { startTime, endTime });
    
    console.log("Time updated:", response.data);
    
    // Update the store with the response data
    updateActivity(activity.id, response.data);
    setPopoverOpen(false);
  }

  const saveDescription = useCallback(async (description: string) => {
    if (!activity.id) throw new Error('Activity ID is required');
    
    const response = await tripDaysApi.updateActivity(activity.id, { description });
    updateActivity(activity.id, response.data);
  }, [activity.id, updateActivity]);

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
    await tripDaysApi.deleteActivity(activity.id);
    removeActivity(activity.id); 
  } catch (error) {
    console.error('Failed to delete activity:', error);
  }
};

  const handleAddExpense = async (description: string, cost: number, category: ExpenseCategory, _activityId?: string, expenseId?: string) => {
    if (!tripId) return;

    try {
      let expense;
      
      if (expenseId) {
        // Update existing expense
        const response = await budgetApi.updateExpense(expenseId, { description, cost, category });
        expense = response.data;
        toast.success('Expense updated successfully!');
      } else {
        // Add new expense
        const response = await budgetApi.addExpense(tripId, { description, cost, category, activityId: activity.id });
        expense = response.data;
        toast.success('Expense added successfully!');
      }

      // Update activity in store to include the new/updated expense
      if (expense) {
        const updatedActivity = { ...activity, expense } as any;
        updateActivity(activity.id!, updatedActivity);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const formatCost = (cost?: number) => {
    if (cost === undefined || cost === null) return '';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(cost);
    } catch (e) {
      return `$${cost}`;
    }
  };



  return (
    <div className="flex items-start gap-6 my-4">
      {/* Timeline */}
      <div className="flex flex-col items-center min-w-[60px]">
        {activity.startTime ? (
          <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-gray-600 mb-2">
              {formatTimeDisplay(activity.startTime, activity.endTime)}
            </div>
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 bg-white rounded-full"></div>
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
        <div className="w-0.5 h-24 bg-gray-300 mt-3"></div>
      </div>

      {/* Activity Card */}
      <div className="flex-1">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-slate-800">
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
                    className="p-3 w-full resize-none rounded-md bg-gray-50 dark:bg-slate-700 border border-transparent focus:border-neutral-300 focus:ring-0"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: time and location */}
            <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-3 flex gap-4 items-center text-sm text-slate-500 dark:text-slate-300 font-semibold">

              <div className="flex items-center">
                <FaMoneyBillWave className="text-gray-500 hover:text-slate-800" />
                {activity.expense ? (
                  <span 
                    className="ml-2 font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-800 cursor-pointer"
                    onClick={() => setShowAddExpenseDialog(true)}
                  >
                    {formatCost(activity.expense.cost)}
                  </span>
                ) : (
                  <button className="ml-2 text-sm hover:text-slate-800 cursor-pointer" onClick={() => setShowAddExpenseDialog(true)}>
                    Add cost
                  </button>
                )}
              </div>
              
              <AddExpenseDialog
                open={showAddExpenseDialog}
                activity={activity}
                expense={activity.expense || undefined}
                onOpenChange={setShowAddExpenseDialog}
                onSubmit={handleAddExpense}
              />

              <div className="flex items-center hover:text-slate-800 cursor-pointer">
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center">
                      <MdAccessTimeFilled className="hover:text-slate-800" />
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
