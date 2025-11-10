import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi } from './services/api';
import type { Trip } from '@/types/trip';
import { format } from 'date-fns';
import { FaUsers, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

export function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTrips = async () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500 dark:text-slate-400">Loading trips...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-500 dark:text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2">No trips yet</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Start planning your next adventure!</p>
              <Link
                to="/trips/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Create Your First Trip
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300/50 rounded-2xl dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Trips</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            All your collaborative travel plans in one place
          </p>
        </div>

        {/* Create New Trip Button */}
        <div className="mb-8">
          <Link
            to="/trips/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
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
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700">
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {trip.title}
                  </h3>

                  {/* Destination */}
                  {trip.destination && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-3">
                      <FaMapMarkerAlt className="text-indigo-500 flex-shrink-0" />
                      <span className="text-sm truncate">{trip.destination}</span>
                    </div>
                  )}

                  {/* Date Range */}
                  {trip.startDate && trip.endDate && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-3">
                      <FaCalendarAlt className="text-indigo-500 flex-shrink-0" />
                      <span className="text-sm">
                        {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {trip.description && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  {/* Members Count */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <FaUsers className="text-gray-500 dark:text-slate-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {trip.members?.length || 0} {trip.members?.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
