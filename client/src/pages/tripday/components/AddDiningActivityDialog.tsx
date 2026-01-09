import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GoogleDiningSearch from "./GoogleDiningSearch";
import AIDiningSearch from "./AIDiningSearch";
import React, { useState, useEffect } from "react";
import type { Place } from "./PlaceInput";
import type { CreateActivityRequest } from "@/types/activity";

interface AddDiningActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (activity: CreateActivityRequest) => void;
  tripId: string;
  destination: string;
}


const AddDiningActivityDialog: React.FC<AddDiningActivityDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  tripId,
  destination
}) => {

      const [searchMode, setSearchMode] = useState<'google' | 'ai'>('google');
      const [placeName, setPlaceName] = useState("");
      const [selectedDining, setSelectedDining] = useState<CreateActivityRequest | null>(null);
      const [customInput, setCustomInput] = useState("");
      const [isSubmitting, setIsSubmitting] = useState(false);
    
      useEffect(() => {
        if (!isOpen) {
          setSearchMode('google');
          setPlaceName("");
          setSelectedDining(null);
          setCustomInput("");
          setIsSubmitting(false);
        }
      }, [isOpen]);
    
      const handleSubmit = async (e: React.FormEvent) => {
        console.log("test ai submit: ", selectedDining, placeName);
        e.preventDefault();
        if (selectedDining) {
          setIsSubmitting(true);
          try {
            await onSubmit({
              name: selectedDining.name || placeName || "",
              address: selectedDining.address || "",
              latitude: selectedDining.latitude,
              longitude: selectedDining.longitude,
              description: selectedDining.description
            });
            onOpenChange(false);
          } catch (error) {
            console.error("Failed to create activity:", error);
          } finally {
            setIsSubmitting(false);
          }
        }
      };
    
      const handleDialogClose = (open: boolean) => {
        if (!isSubmitting) {
          onOpenChange(open);
        }
      };


    return (
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[70vh] max-w-[600px] flex flex-col z-100">
          <DialogHeader>
            <DialogTitle>Add Dining</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1">
              <div className="flex items-center justify-between mb-4">
                
                <div>
                  <h3 className="text-xs mb-1 font-bold text-slate-500">SEARCH MODE</h3>
                  <h3 className='text-sm font-semibold transition-all'>{searchMode === 'google' ? 'Google Places' : 'AI Discovery'}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={searchMode === 'google' ? 'default' : 'outline'}
                    onClick={() => setSearchMode('google')}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant={searchMode === 'ai' ? 'default' : 'outline'}
                    onClick={() => setSearchMode('ai')}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Find
                  </Button>
                </div>
              </div>

              {searchMode === 'google' ? (
                  <GoogleDiningSearch
                    placeName={placeName}
                    onPlaceNameChange={setPlaceName}
                    onPlaceSelect={setSelectedDining}
                    disabled={isSubmitting}
                  />
              ) : (
                <AIDiningSearch
                  customInput={customInput}
                  onCustomInputChange={setCustomInput}
                  onDiningSelect={setSelectedDining}
                  tripId={tripId}
                  destination={destination}
                  disabled={isSubmitting}
                />
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedDining}
              >
                {isSubmitting ? 'Adding...' : 'Save Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
}


export default AddDiningActivityDialog;
