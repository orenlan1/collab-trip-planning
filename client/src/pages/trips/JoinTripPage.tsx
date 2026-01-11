import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


interface InvitationDetails {
  trip: {
    id: string;
    title: string;
  };
  inviterUser: {
    name: string;
  };
  isAlreadyMember: boolean;
}

export function JoinTripPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/trips/invite/magic-link/${token}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Invalid or expired invitation');
        }
        const data = await response.json();
        setInvitation(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const acceptInvitation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/api/trips/invite/magic-link/${token}/accept`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to join trip');
      }

      const data = await response.json();
      navigate(`/trips/${data.member.tripId}/overview`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Join Trip</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to join {invitation?.trip.title}
          </p>
          <button
            onClick={() => navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (invitation?.isAlreadyMember) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Already a Member</h1>
          <p className="text-gray-600 mb-6">
            You are already a member of{' '}
            <span className="font-semibold">{invitation.trip.title}</span>
          </p>
          <button
            onClick={() => navigate(`/trips/${invitation.trip.id}/overview`)}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600"
          >
            Go to Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Join Trip</h1>
        {invitation && (
          <>
            <p className="text-gray-600 mb-6">
              {invitation.inviterUser.name} has invited you to join{' '}
              <span className="font-semibold">{invitation.trip.title}</span>
            </p>
            <button
              onClick={acceptInvitation}
              disabled={isLoading}
              className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Joining...' : 'Join Trip'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
