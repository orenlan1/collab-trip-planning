import { GoHome } from "react-icons/go";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { lodgingsApi, type Lodging, type CreateLodgingInput, type UpdateLodgingInput } from "@/pages/lodging/services/api";
import { AddLodgingDialog, type LodgingFormData } from "@/pages/lodging/components/AddLodgingDialog";
import { EditLodgingDialog } from "@/pages/lodging/components/EditLodgingDialog";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaTrash, FaEdit } from "react-icons/fa";

export function LodgingCard() {
  const { tripId } = useParams<{ tripId: string }>();
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLodging, setEditingLodging] = useState<Lodging | null>(null);

  useEffect(() => {
    if (tripId) {
      fetchLodgings();
    }
  }, [tripId]);

  const fetchLodgings = async () => {
    if (!tripId) return;
    try {
      const response = await lodgingsApi.getAll(tripId);
      setLodgings(response.data);
    } catch (error) {
      console.error('Failed to fetch lodgings:', error);
    }
  };

  const formatToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddLodging = async (lodgingData: LodgingFormData) => {
    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    try {
      const lodgingInput: CreateLodgingInput = {
        name: lodgingData.name,
        address: lodgingData.address,
        checkIn: formatToYYYYMMDD(lodgingData.checkInDate),
        checkOut: formatToYYYYMMDD(lodgingData.checkOutDate),
        guests: lodgingData.guests,
      };

      const response = await lodgingsApi.create(tripId, lodgingInput);
      setLodgings([...lodgings, response.data]);
      toast.success('Lodging added successfully!');
    } catch (error: any) {
      console.error('Failed to add lodging:', error);
      throw error;
    }
  };

  const handleUpdateLodging = async (lodgingData: LodgingFormData) => {
    if (!tripId || !editingLodging) {
      throw new Error('Trip ID and lodging are required');
    }

    try {
      const lodgingInput: UpdateLodgingInput = {
        name: lodgingData.name,
        address: lodgingData.address,
        checkIn: formatToYYYYMMDD(lodgingData.checkInDate),
        checkOut: formatToYYYYMMDD(lodgingData.checkOutDate),
        guests: lodgingData.guests,
      };

      const response = await lodgingsApi.update(tripId, editingLodging.id, lodgingInput);
      setLodgings(lodgings.map(l => l.id === editingLodging.id ? response.data : l));
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
        setLodgings(lodgings.filter(l => l.id !== lodgingId));
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
                  <h3 className="font-semibold text-lg">{lodging.name}</h3>
                  <p className="text-sm text-gray-600">{lodging.address}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <span>
                      Check-in: {format(new Date(lodging.checkIn), "MMM dd, yyyy")}
                    </span>
                    <span>
                      Check-out: {format(new Date(lodging.checkOut), "MMM dd, yyyy")}
                    </span>
                    <span>Guests: {lodging.guests}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(lodging)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteLodging(lodging.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
