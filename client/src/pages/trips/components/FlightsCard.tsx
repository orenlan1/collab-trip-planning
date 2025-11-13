import { AddFlightDialog } from "@/pages/flights/components/AddFlightDialog";
import { EditFlightDialog } from "@/pages/flights/components/EditFlightDialog";
import type { FlightFormData } from "@/pages/flights/components/AddFlightDialog";
import { useState } from "react";
import { IoAirplaneOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { flightsApi, type Flight } from "@/pages/flights/services/api";
import type { CreateFlightInput, UpdateFlightInput } from "@/pages/flights/services/api";
import { toast } from "react-toastify";
import { useTripStore } from "@/stores/tripStore";
import { format } from "date-fns";
import { FaTrash, FaEdit } from "react-icons/fa";


export function FlightsCard() {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const flights = useTripStore(state => state.flights);
  const addFlight = useTripStore(state => state.addFlight);
  const updateFlight = useTripStore(state => state.updateFlight);
  const deleteFlight = useTripStore(state => state.deleteFlight);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const formatToISO = (date: Date, time: string): string => {
    // Combine date and time into ISO format (YYYY-MM-DDTHH:mm:ssZ)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${time}:00Z`;
  };

  const handleAddFlight = async (flightData: FlightFormData) => {
    if (!tripId) {
      throw new Error('Trip ID is required');
    }

    try {
      const flightInput: CreateFlightInput = {
        airline: flightData.airline,
        flightNumber: flightData.flightNumber,
        from: flightData.from,
        to: flightData.to,
        departure: formatToISO(flightData.departureDate, flightData.departureTime),
        arrival: formatToISO(flightData.arrivalDate, flightData.arrivalTime),
        departureTimezoneId: flightData.departureTimezoneId,
        arrivalTimezoneId: flightData.arrivalTimezoneId,
      };

      console.log('Sending flight data:', flightInput);
      const response = await flightsApi.create(tripId, flightInput);
      addFlight(response.data);
      toast.success('Flight added successfully!');
    } catch (error: any) {
      console.error('Failed to add flight:', error);
      
      // Log detailed validation errors if available
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
        error.response.data.details.forEach((detail: any) => {
          console.error(`- ${detail.field}: ${detail.message}`);
        });
      }
      
      throw error;
    }
  };

  const handleUpdateFlight = async (flightData: FlightFormData) => {
    if (!tripId || !editingFlight) {
      throw new Error('Trip ID and flight are required');
    }

    try {
      const flightInput: UpdateFlightInput = {
        airline: flightData.airline,
        flightNumber: flightData.flightNumber,
        from: flightData.from,
        to: flightData.to,
        departure: formatToISO(flightData.departureDate, flightData.departureTime),
        arrival: formatToISO(flightData.arrivalDate, flightData.arrivalTime),
        departureTimezoneId: flightData.departureTimezoneId,
        arrivalTimezoneId: flightData.arrivalTimezoneId,
      };

      console.log('Updating flight data:', flightInput);
      const response = await flightsApi.update(tripId, editingFlight.id, flightInput);
      updateFlight(editingFlight.id, response.data);
      toast.success('Flight updated successfully!');
    } catch (error: any) {
      console.error('Failed to update flight:', error);
      
      // Log detailed validation errors if available
      if (error.response?.data?.details) {
        console.error('Validation errors:', error.response.data.details);
        error.response.data.details.forEach((detail: any) => {
          console.error(`- ${detail.field}: ${detail.message}`);
        });
      }
      
      throw error;
    }
  };

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight);
    setShowEditDialog(true);
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (!tripId) {
      toast.error('Trip ID is missing');
      return;
    }

    if (!confirm('Are you sure you want to delete this flight?')) {
      return;
    }

    try {
      await flightsApi.delete(tripId, flightId);
      deleteFlight(flightId);
      toast.success('Flight deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete flight:', error);
      toast.error(error.response?.data?.error || 'Failed to delete flight');
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) {
      setEditingFlight(null);
    }
  };

  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 shadow-sm">
      <div className="flex px-4 gap-3 items-center justify-between mb-4">
        <div className="flex gap-3 items-center">
          <IoAirplaneOutline className="text-xl text-indigo-500" />
          <h1 className="font-semibold text-xl">Flights</h1>
        </div>
        <button 
          onClick={() => setShowAddDialog(true)} 
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition text-sm font-medium"
        >
          Add Flight
        </button>
      </div>
      
      {flights.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="text-indigo-500 mb-4">
            <IoAirplaneOutline className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Flights Yet?</h3>
          <p className="text-gray-600 mb-6">
            It looks like you haven't added any flights for this trip. Let's get started!
          </p>
          <button onClick={() => navigate("/search/flights")} className="border-2 border-indigo-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">
            Search Flights
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {flights.map((flight) => (
            <div 
              key={flight.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IoAirplaneOutline className="text-indigo-500" />
                  <span className="font-semibold text-gray-900">{flight.airline}</span>
                  <span className="text-sm text-gray-500">#{flight.flightNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleEditFlight(flight)}
                    className="text-indigo-500 hover:text-indigo-700 transition"
                    title="Edit flight"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFlight(flight.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete flight"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Departure</p>
                  <p className="font-medium text-gray-900">{flight.from}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(flight.departure), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(flight.departure), 'HH:mm')}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 mb-1">Arrival</p>
                  <p className="font-medium text-gray-900">{flight.to}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(flight.arrival), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(flight.arrival), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddFlightDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onFlightAdded={handleAddFlight}
      />

      <EditFlightDialog 
        open={showEditDialog} 
        onOpenChange={handleEditDialogClose}
        onFlightUpdated={handleUpdateFlight}
        flight={editingFlight}
      />
    </div>
  );
}
