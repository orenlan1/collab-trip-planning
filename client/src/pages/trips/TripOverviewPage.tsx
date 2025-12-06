import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { FlightsCard } from './components/FlightsCard';
import { ParticipantsCard } from './components/ParticipantsCard';
import { DestinationCard } from './components/DestinationCard';
import { DescriptionCard} from './components/DescriptionCard';
import { LodgingCard } from './components/LodgingCard';
import { useTripStore } from '@/stores/tripStore';
import { BsCalendar4 } from "react-icons/bs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatesSetter } from './components/DatesSetter';
import { tripsApi } from './services/api';
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

    useEffect(() => {
    const fetchTripData = async () => {
      if (tripId) {
        try {
          setIsLoading(true);
          const response = await tripsApi.getById(tripId);
          setTripData(response.data);
          // Fetch flights and lodgings after trip data is loaded
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

    fetchTripData();
  }, [tripId, setTripData, fetchFlights, fetchLodgings]);


  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
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

        <div className="absolute bottom-6 left-6 right-6 text-white ">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-semibold">
                {title}
              </h1>
            </div>
            <div className='flex items-center gap-2'>
             
              <div
                className='relative flex flex-col items-center justify-center w-8 h-8 bg-white/80 border border-indigo-500 rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-110 hover:bg-indigo-100 group'
                title='View trip dates'
              >
                <div className='absolute top-0 left-0 w-full h-1.5 bg-indigo-500 rounded-t-lg' />
                <Popover>
                  <PopoverTrigger asChild>
                    <div className='flex items-center justify-center w-full h-full'>
                      <BsCalendar4 className='text-indigo-600 z-10' size={16} />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent side='bottom' align='start' className='w-auto p-0'>
                    <DatesSetter />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-md text-slate-200 font-semibold">
                {startDate && new Date(startDate).toLocaleDateString()} - {endDate && new Date(endDate).toLocaleDateString()} • {members.length} travelers • Hosted by {members.find(m => m.role === "creator")?.user.name}
              </p>
            </div>
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