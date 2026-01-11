import { GoHome } from "react-icons/go";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { lodgingsApi, type Lodging, type CreateLodgingInput, type UpdateLodgingInput } from "@/pages/lodging/services/api";
import { AddLodgingDialog, type LodgingFormData } from "@/pages/lodging/components/AddLodgingDialog";
import { EditLodgingDialog } from "@/pages/lodging/components/EditLodgingDialog";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaTrash, FaEdit, FaMoneyBillWave } from "react-icons/fa";
import { AddExpenseDialog } from "@/pages/budget/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/pages/budget/components/EditExpenseDialog";
import type { Expense } from "@/types/expense";
import { budgetApi } from "@/pages/budget/services/budgetApi";
import type { ExpenseCategory } from "@/pages/budget/types/budget";
import { formatCurrencyAmount } from "@/lib/currency";
import { useTripStore } from "@/stores/tripStore";
import { GoogleMaps } from "@/components/GoogleMaps";
import { FaBed } from "react-icons/fa";
import { GrLocationPin } from "react-icons/gr";

export function LodgingCard() {
  const { tripId } = useParams<{ tripId: string }>();
  const lodgings = useTripStore(state => state.lodgings);
  const addLodging = useTripStore(state => state.addLodging);
  const updateLodging = useTripStore(state => state.updateLodging);
  const deleteLodging = useTripStore(state => state.deleteLodging);
  const latitude = useTripStore(state => state.latitude);
  const longitude = useTripStore(state => state.longitude);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLodging, setEditingLodging] = useState<Lodging | null>(null);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);
  const [expenseLodging, setExpenseLodging] = useState<Lodging | null>(null);

  const formatToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddLodging = async (lodgingData: LodgingFormData) => {
    if (!tripId || !lodgingData.checkInDate || !lodgingData.checkOutDate) {
      throw new Error('Trip ID and dates are required');
    }

    try {
      const lodgingInput: CreateLodgingInput = {
        name: lodgingData.name,
        address: lodgingData.address,
        checkIn: formatToYYYYMMDD(lodgingData.checkInDate),
        checkOut: formatToYYYYMMDD(lodgingData.checkOutDate),
        latitude: lodgingData.latitude,
        longitude: lodgingData.longitude
      };

      const response = await lodgingsApi.create(tripId, lodgingInput);
      addLodging(response.data);
      toast.success('Lodging added successfully!');
    } catch (error: any) {
      console.error('Failed to add lodging:', error);
      throw error;
    }
  };

  const handleUpdateLodging = async (lodgingData: LodgingFormData) => {
    if (!tripId || !editingLodging || !lodgingData.checkInDate || !lodgingData.checkOutDate) {
      throw new Error('Trip ID, lodging, and dates are required');
    }

    try {
      const lodgingInput: UpdateLodgingInput = {
        name: lodgingData.name,
        address: lodgingData.address,
        checkIn: formatToYYYYMMDD(lodgingData.checkInDate),
        checkOut: formatToYYYYMMDD(lodgingData.checkOutDate),
        latitude: lodgingData.latitude,
        longitude: lodgingData.longitude
      };

      const response = await lodgingsApi.update(tripId, editingLodging.id, lodgingInput);
      updateLodging(editingLodging.id, response.data);
      toast.success('Lodging updated successfully!');
    } catch (error: any) {
      console.error('Failed to update lodging:', error);
      throw error;
    }
  };

  const handleDeleteLodging = async (lodgingId: string) => {
    if (!tripId) return;

    if (window.confirm('Are you sure you want to delete this lodging?')) {
      try {
        await lodgingsApi.delete(tripId, lodgingId);
        deleteLodging(lodgingId);
        toast.success('Lodging deleted successfully!');
      } catch (error) {
        console.error('Failed to delete lodging:', error);
        toast.error('Failed to delete lodging');
      }
    }
  };

  const handleEditClick = (lodging: Lodging) => {
    setEditingLodging(lodging);
    setShowEditDialog(true);
  };

  const handleAddExpense = async (description: string, cost: number, category: ExpenseCategory, currency?: string) => {
    if (!tripId || !expenseLodging) return;

    const lodgingDate = new Date(expenseLodging.checkIn);
    const dateString = format(lodgingDate, 'yyyy-MM-dd');

    try {
      const response = await budgetApi.addExpense(tripId, { 
        description, 
        cost, 
        category, 
        lodgingId: expenseLodging.id, 
        currency, 
        date: dateString 
      });
      
      toast.success('Expense added successfully!');
      
      const updatedLodging = {
        ...expenseLodging,
        expense: response.data
      };
      updateLodging(expenseLodging.id, updatedLodging);
      setShowAddExpenseDialog(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditExpense = async (expenseId: string, description: string, cost: number, category: ExpenseCategory, currency?: string, date?: string) => {
    if (!expenseLodging || !tripId) return;

    try {
      const response = await budgetApi.updateExpense(tripId, expenseId, { 
        description, 
        cost, 
        category, 
        currency,
        date
      });
      
      setShowEditExpenseDialog(false);
      toast.success('Expense updated successfully!');
      
      const updatedLodging = {
        ...expenseLodging,
        expense: response.data
      };
      updateLodging(expenseLodging.id, updatedLodging);
    } catch (error: any) {
      throw error;
    }
  };

  const handleOpenExpenseDialog = (lodging: Lodging) => {
    setExpenseLodging(lodging);
    if (lodging.expense) {
      setShowEditExpenseDialog(true);
    } else {
      setShowAddExpenseDialog(true);
    }
  };

  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 dark:bg-slate-800 shadow-sm">
      <div className="flex px-4 gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <GoHome className="text-xl text-indigo-500" />
          <h1 className="font-semibold text-xl">Lodging</h1>
        </div>
        {lodgings.length > 0 && (
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-indigo-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-600 transition font-semibold"
          >
            Add Lodging
          </button>
        )}
      </div>
      
      {lodgings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="text-indigo-500 mb-4">
            <GoHome className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Lodging Booked?</h3>
          <p className="text-gray-600 mb-6">
            Looks like you haven't secured your stay. Find the perfect place to relax!
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Add Lodging
            </button>
            <button className="border-2 border-indigo-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">
              Search Lodging
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {lodgings.map((lodging) => (
            <div
              key={lodging.id}
              className="border border-gray-200 dark:bg-slate-700 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg dark:text-white mb-3">{lodging.name}</h3>
                  <div className="flex items-center">
                    <GrLocationPin className="inline-block text-gray-400 dark:text-slate-300 mr-1" />
                    <p className="text-sm font-semibold text-gray-400 dark:text-slate-300">{lodging.address}</p>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm text-gray-700 dark:text-slate-300">
                    <span>
                      Check-in: {format(new Date(lodging.checkIn), "MMM dd, yyyy")}
                    </span>
                    <span>
                      Check-out: {format(new Date(lodging.checkOut), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenExpenseDialog(lodging)}
                    className="text-green-600 hover:text-green-700 transition"
                    title={lodging.expense ? "Edit expense" : "Add expense"}
                  >
                    <FaMoneyBillWave className="w-4 h-4" />
                    {lodging.expense && (
                      <span className="ml-1 text-xs font-semibold">
                        {formatCurrencyAmount(lodging.expense.cost, lodging.expense.currency)}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditClick(lodging)}
                    className="text-indigo-500 hover:text-indigo-700 "
                  >
                    <FaEdit  />
                  </button>
                  <button
                    onClick={() => handleDeleteLodging(lodging.id)}
                    className="text-slate-400 hover:text-red-700 "
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="h-[400px] ">
            <GoogleMaps center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined} 
            markers={lodgings.map(lodging => ({
              id: lodging.id,
              lat: lodging.latitude || 0,
              lng: lodging.longitude || 0,
            }))}
            pin={
              <div className="relative">
                <div className="absolute -top-12 -left-6 flex flex-col items-center">
                  <div className="bg-indigo-500 rounded-full p-3 shadow-lg border-4 border-white hover:scale-110 transition-transform">
                    <FaBed className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white -mt-1" />
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-indigo-500 -mt-[11px]" />
                </div>
              </div>
          }
            />
          </div>
        </div>
      )}

      <AddLodgingDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onLodgingAdded={handleAddLodging}
      />

      <EditLodgingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onLodgingUpdated={handleUpdateLodging}
        lodging={editingLodging}
      />

      {expenseLodging && (
        <>
          <AddExpenseDialog
            open={showAddExpenseDialog}
            onOpenChange={setShowAddExpenseDialog}
            onSubmit={handleAddExpense}
          />

          <EditExpenseDialog
            open={showEditExpenseDialog}
            expense={expenseLodging.expense as Expense | null}
            onOpenChange={setShowEditExpenseDialog}
            onSubmit={handleEditExpense}
          />
        </>
      )}
    </div>
  );
}
