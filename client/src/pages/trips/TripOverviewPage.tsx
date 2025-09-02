import { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { FlightsCard } from './components/FlightsCard';
import { ParticipantsCard } from './components/ParticipantsCard';
import { DestinationCard } from './components/DestinationCard';
import { DescriptionCard} from './components/DescriptionCard';
import { LodgingCard } from './components/LodgingCard';
import { useTripStore } from '@/stores/tripStore';



export const TripOverviewPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const image = useTripStore(state => state.image);
  const title = useTripStore(state => state.title);
  const members = useTripStore(state => state.members);
  const startDate = useTripStore(state => state.startDate);
  const endDate = useTripStore(state => state.endDate);
  const setTripData = useTripStore(state => state.setTripData);

   useEffect(() => {
    if (tripId) {
      setTripData(tripId);
    }
  }, [tripId, setTripData]);


  return (
    <div className="flex-1 ">
      <div className="relative h-[300px]">
        <div className="absolute inset-0">
          <img
            src={image || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"}
            alt="Trip cover"
            className="w-full h-full object-cover rounded-t-2xl"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-semibold">
                {title}
              </h1>
            </div>
            <p className="text-sm text-slate-200">
              {startDate && new Date(startDate).toLocaleDateString()} - {endDate && new Date(endDate).toLocaleDateString()} • {members.length} travelers • Hosted by {members.find(m => m.role === "creator")?.user.name}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-4 md:px-0'>
        <div className='md:col-span-2'>
          <DestinationCard />
        </div>
        <div>
          <ParticipantsCard tripId={tripId!} />
        </div>   
      </div>

      <div className='mt-6'>
        <DescriptionCard />
      </div>

      <div className='mt-6'>
        <FlightsCard />
      </div>

      <div className='mt-6'>
        <LodgingCard />
      </div>

    </div>
  );
};