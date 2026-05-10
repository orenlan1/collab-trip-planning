import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi } from './services/api';
import type { Trip } from '@/types/trip';
import { format } from 'date-fns';
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { DeleteTripDialog } from './components/DeleteTripDialog';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export function MyTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTrips = async (): Promise<void> => {
      try {
        const response = await tripsApi.getAll();
        console.log('API Response:', response.data);
        setTrips(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, tripId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingTripId(tripId);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingTripId) return;

    setIsDeleting(true);
    try {
      await tripsApi.delete(deletingTripId);
      setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== deletingTripId));
      toast.success('Trip deleted successfully');
      setDeletingTripId(null);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast.error('Failed to delete trip. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (): void => {
    if (!isDeleting) {
      setDeletingTripId(null);
    }
  };

  const getTripToDelete = (): Trip | undefined => {
    return trips.find((trip) => trip.id === deletingTripId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6">Start planning your next adventure!</p>
          <Link
            to="/trips/create"
            className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg text-primary-foreground bg-primary hover:opacity-90 transition"
          >
            Create Your First Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Trips</h1>
          <p className="mt-1.5 text-muted-foreground">
            All your collaborative travel plans in one place
          </p>
        </div>
        <Link
          to="/trips/create"
          className="inline-flex items-center self-start sm:self-auto px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:opacity-90 transition shadow-sm"
        >
          + Create New Trip
        </Link>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips && trips.length > 0 && trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}/overview`}
              className="group"
            >
              <div className="bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-border/60 hover:-translate-y-0.5">
                {/* Trip Image */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  {trip.image ? (
                    <img
                      src={trip.image}
                      alt="trip photo"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-white text-6xl font-bold opacity-20">
                        {trip.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Trip Content */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {trip.title}
                  </h3>

                  {/* Destination */}
                  {trip.destination && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <FaMapMarkerAlt className="text-primary shrink-0" />
                      <span className="text-sm truncate">{trip.destination}</span>
                    </div>
                  )}

                  {/* Date Range */}
                  {trip.startDate && trip.endDate && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <FaCalendarAlt className="text-primary shrink-0" />
                      <span className="text-sm">
                        {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {trip.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  {/* Members Count and Delete Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">
                        {trip.members?.length || 0} {trip.members?.length === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    {trip.members.find(m => m.userId === user?.id)?.role === 'CREATOR' && (
                      <button
                        onClick={(e) => handleDeleteClick(e, trip.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
                        aria-label="Delete trip"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
        ))}
      </div>

      <DeleteTripDialog
        open={deletingTripId !== null}
        tripTitle={getTripToDelete()?.title || ''}
        isDeleting={isDeleting}
        onOpenChange={handleDialogClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
