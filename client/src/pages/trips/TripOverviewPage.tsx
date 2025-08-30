import { useState, useEffect} from 'react';
import { tripsApi, invitationsApi } from './services/api';
import { useParams } from 'react-router-dom';
import { TripMember } from './components/TripMember';
import { FlightsCard } from './components/FlightsCard';
import { ParticipantsCard } from './components/ParticipantsCard';
import { DestinationCard } from './components/DestinationCard';
import { DescriptionCard} from './components/DescriptionCard';
import { LodgingCard } from './components/LodgingCard';



interface TripData {
  title: string;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  image: string | null;
  members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
    };
  }>;
  itinerary: {
    id: string;
  }; 
}

export const TripOverviewPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [inviteeEmail, setInviteeEmail] = useState<string>("");
 



  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        console.log("Fetching trip details for ID:", tripId);
        const response = await tripsApi.getById(tripId!);
        console.log("Trip details:", response.data);
        setTrip(response.data);
      } catch (error) {
        console.error("Failed to fetch trip details:", error);
      }
    };

    fetchTripDetails();

  }, []);

  return (
    <div className="flex-1 ">
      <div className="relative h-[300px]">
        <div className="absolute inset-0">
          <img
            src={trip?.image || "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e"}
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
                {trip?.title}
              </h1>
            </div>
            <p className="text-sm text-slate-200">
              {trip?.startDate && new Date(trip.startDate).toLocaleDateString()} - {trip?.endDate && new Date(trip.endDate).toLocaleDateString()} • {trip?.members.length} travelers • Hosted by {trip?.members.find(m => m.role === "creator")?.user.name}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-4 md:px-0'>
        <div className='md:col-span-2'>
          <DestinationCard destination={trip?.destination ?? ""} />
        </div>
        <div>
          <ParticipantsCard members={trip?.members ?? []} tripId={tripId!} />
        </div>   
      </div>

      <div className='mt-6'>
        <DescriptionCard description={trip?.description ?? ""} />
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