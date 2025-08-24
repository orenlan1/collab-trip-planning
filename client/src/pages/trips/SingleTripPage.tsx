import { useState, useEffect} from 'react';
import { tripsApi, invitationsApi } from './services/api';
import { useParams } from 'react-router-dom';
import { TripMember } from './components/TripMember';


interface TripData {
  title: string;
  destination: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
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
}

export const SingleTripPage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [inviteeEmail, setInviteeEmail] = useState<string>("");


  const sendInvitation = async () => {
    if (!tripId || !inviteeEmail) return;
    
    
    try {
      console.log("Sending invitation to:", inviteeEmail, "with trip ID:", tripId);
      await invitationsApi.invite(tripId, inviteeEmail);
      setInviteeEmail(""); // Clear the input after sending
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  }


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
    <div className='bg-white/80 border-sky-200'>
      <h1 className='text-xl font-bold text-center'>{trip?.title}</h1>
      <div>
        <div className='flex items-center justify-between'>
          <div className='text-sm font-semibold tracking-tight'>
            <h3>Participants:</h3>
          </div>
          <div className='text-xs text-slate-500'>
            {trip?.members.length} total
          </div>
        </div>
        
        <ul>
          {trip?.members.map(member => (
            <TripMember key={member.userId} member={member} />
          ))}
        </ul>
        <input 
          className='border border-gray-300 p-2 rounded bg-indigo-50' 
          value={inviteeEmail}
          onChange={(e) => setInviteeEmail(e.target.value)} 
          type="text" 
          placeholder="Enter email address"
        />
        <button 
          className='hover:bg-blue-600 bg-blue-500 text-white px-4 py-2 rounded ml-2' 
          onClick={sendInvitation}
          disabled={!inviteeEmail}
        >
          Invite
        </button>
      </div>
    </div>
  );
};
