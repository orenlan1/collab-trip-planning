import { useCallback } from "react";
import { IoDocumentTextOutline, IoSaveOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { tripsApi } from "../services/api";
import { useTripStore } from "@/stores/tripStore";
import { useAutoSaveInput } from "@/hooks/useAutoSaveInput";
import { AutoSaveInputStatusRender } from "@/components/AutoSaveInputStatusRender";

export function DescriptionCard() {
    const { tripId } = useParams<{ tripId: string }>();
    const storeDescription = useTripStore(state => state.description);

    // Auto-save function to update trip description
    const saveDescription = useCallback(async (description: string) => {
        if (!tripId) throw new Error('Trip ID is required');
        
        await tripsApi.update(tripId, { description });
    }, [tripId]);

    // Initialize auto-save hook with the current store value
    const {
        value: description,
        updateValue: setDescription,
        saveState,
        error,
        hasUnsavedChanges
    } = useAutoSaveInput({
        saveFunction: saveDescription,
        initialValue: storeDescription || '',
        debounceMs: 1000,      // Wait 1 second after user stops typing
        savedDisplayMs: 1000,   // Show "saved" for 1 second
        minSavingMs: 1000       // Show "saving" for at least 1000ms
    });


    return (
        <div className="border-1 rounded-xl py-3 h-full bg-white/80 shadow-sm">
            <div className="flex px-4 gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                    <IoDocumentTextOutline className="text-xl text-indigo-500" />
                    <h1 className="font-semibold text-xl">Description</h1>
                    {/* {renderSaveStatus()} */}
                    <AutoSaveInputStatusRender hasUnsavedChanges={hasUnsavedChanges} saveState={saveState} ></AutoSaveInputStatusRender>
                </div>
            </div>
            
            <div className="relative p-4">
                <textarea
                    className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for your trip..."
                    rows={4}
                />
                {error && (
                    <div className="mt-2 text-sm text-red-600">
                        Error saving: {error}
                    </div>
                )}
            </div>
        </div>
    );
}
