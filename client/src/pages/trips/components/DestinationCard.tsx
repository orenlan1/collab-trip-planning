import { useTripStore } from "@/stores/tripStore";
import { useCallback } from "react";
import { FiMapPin } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { tripsApi } from "../services/api";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { IoCheckmarkCircleOutline, IoSaveOutline } from "react-icons/io5";
import { AutoSaveInputStatusRender } from "@/components/AutoSaveInputStatusRender";

export function DestinationCard() {
  const { tripId } = useParams<{ tripId: string }>();
  const storeDestination = useTripStore(state => state.destination);

  const saveDestination = useCallback(async (destination: string) => {
        if (!tripId) throw new Error('Trip ID is required');

        await tripsApi.update(tripId, { destination });
    }, [tripId]);

  const { value: destination,
        updateValue: setDestination,
        saveState,
        error,
        hasUnsavedChanges
  } = useAutoSaveInput({
        saveFunction: saveDestination,
        initialValue: storeDestination || '',
        debounceMs: 1000,      // Wait 1 second after user stops typing
        savedDisplayMs: 1000,   // Show "saved" for 1 second
        minSavingMs: 1000       // Show "saving" for at least 1000ms
  })


  return (
    <div className="border-1 rounded-xl py-3 h-full bg-white/80 shadow-sm">
      <div className="flex px-4 gap-3 items-center">
        <FiMapPin className="text-xl text-indigo-500" />
        <h1 className="font-semibold text-xl">Destination</h1>
        <AutoSaveInputStatusRender hasUnsavedChanges={hasUnsavedChanges} saveState={saveState} />
      </div>
      <div className="relative p-4">
        <FiMapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={destination ?? ""}
          className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8"
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div >
        <p className="ml-4 text-sm text-gray-500">country, region or city</p>
      </div>
      
    </div>
  );
}
