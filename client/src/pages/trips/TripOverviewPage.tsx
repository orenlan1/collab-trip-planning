import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { FlightsCard } from './components/FlightsCard';
import { ParticipantsCard } from './components/ParticipantsCard';
import { DestinationCard } from './components/DestinationCard';
import { DescriptionCard} from './components/DescriptionCard';
import { LodgingCard } from './components/LodgingCard';
import { useTripStore } from '@/stores/tripStore';
import { BsCalendar4 } from "react-icons/bs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatesSetter } from './components/DatesSetter';

import { TailSpin } from 'react-loader-spinner'


export const TripOverviewPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const image = useTripStore(state => state.image);
  const title = useTripStore(state => state.title);
  const members = useTripStore(state => state.members);
  const startDate = useTripStore(state => state.startDate);
  const endDate = useTripStore(state => state.endDate);
  const setTripData = useTripStore(state => state.setTripData);
  const fetchFlights = useTripStore(state => state.fetchFlights);
  const fetchLodgings = useTripStore(state => state.fetchLodgings);
  const [isLoading, setIsLoading] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);

    useEffect(() => {
    const fetchFlightsAndLodgings = async () => {
      if (tripId) {
        try {
          setIsLoading(true);
          await Promise.all([
            fetchFlights(tripId),
            fetchLodgings(tripId)
          ]);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching trip data:", error);
          setIsLoading(false);
        }
      }
    };

    fetchFlightsAndLodgings();
  }, [tripId, setTripData, fetchFlights, fetchLodgings]);


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <TailSpin
          height="80"
          width="80"
          color="#4F46E5"
          ariaLabel="loading"
        />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="relative h-[360px]">
        <div className="absolute inset-0">
          <img
            src={image || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"}
            alt="Trip cover"
            className="w-full h-full object-cover rounded-t-2xl"
          />
          {/* Deeper gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent rounded-t-2xl" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold drop-shadow-lg">
              {title}
            </h1>
            <div className="flex items-center gap-2.5">
              <div
                className="relative flex flex-col items-center justify-center w-8 h-8 bg-white/90 border border-primary/60 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-primary/10 group"
                title="View trip dates"
                onClick={() => setShowDateDialog(true)}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary to-violet-500 rounded-t-lg" />
                <BsCalendar4 className="text-primary z-10" size={16} />
              </div>
              <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
                <DialogContent className="w-auto max-w-fit p-0 overflow-hidden">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Set Trip Dates</DialogTitle>
                  </DialogHeader>
                  <DatesSetter />
                </DialogContent>
              </Dialog>
              <p className="text-sm text-white/90 font-medium">
                {startDate && new Date(startDate).toLocaleDateString()} - {endDate && new Date(endDate).toLocaleDateString()} • {members.length} travelers • Hosted by {members.find(m => m.role === "CREATOR")?.user.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-4 md:px-0 animate-fade-slide-up">
        <div className="md:col-span-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl">
          <DestinationCard />
        </div>
        <div className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl animation-delay-50">
          <ParticipantsCard tripId={tripId!} />
        </div>
      </div>

      <div className="mt-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl animate-fade-slide-up animation-delay-100">
        <DescriptionCard />
      </div>

      <div className="mt-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl animate-fade-slide-up animation-delay-150">
        <FlightsCard />
      </div>

      <div className="mt-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl animate-fade-slide-up animation-delay-200">
        <LodgingCard />
      </div>
    </div>
  );
};