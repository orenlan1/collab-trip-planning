// TripLayout.tsx
import { Navbar } from '../components/navigation/top/Navbar';
import { TripSidebar } from '../pages/trips/navigation/TripSidebar';
import { Outlet, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { TripChatSocketProvider } from '@/context/TripChatSocketContext';
import { TripItinerarySocketProvider } from '@/context/TripItinerarySocketContext';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useTripStore } from '@/stores/tripStore';
import { useEffect, useState } from 'react';
import { tripsApi } from '@/pages/trips/services/api';
import { TailSpin } from 'react-loader-spinner';
import { useSocket } from '@/context/SocketContext';
import { useJoinTripSocket } from '@/hooks/useJoinTripSocket';
export const notifySuccess = (message: string) => toast.success(message);

export function TripLayout() {
  const { tripId } = useParams<{ tripId: string }>();
  const setTripData = useTripStore(state => state.setTripData);
  const currentTripId = useTripStore(state => state.id);
  const reset = useTripStore(state => state.reset);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useJoinTripSocket();
  
  useEffect(() => {
    const fetchTripData = async () => {
      if (!tripId) return;

      // If switching to a different trip, reset the store first
      if (currentTripId && currentTripId !== tripId) {
        reset();
      }

      // Skip fetch if we already have this trip loaded
      if (currentTripId === tripId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await tripsApi.getById(tripId);
        await setTripData(response.data);
      } catch (err) {
        console.error('Failed to fetch trip data:', err);
        setError('Failed to load trip data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripData();
  }, [tripId, currentTripId, setTripData, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-50 dark:bg-slate-900 flex items-center justify-center">
        <TailSpin height="80" width="80" color="#4F46E5" ariaLabel="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <TripChatSocketProvider>
        <TripItinerarySocketProvider>
          <ScrollToTop excludePaths={['/chat']} />
          <div className="flex relative">
            <TripSidebar />
            <main className="flex-1 w-full lg:max-w-[1400px] mx-auto py-8 px-4 lg:px-6 mt-16 lg:mt-0">
              <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
              />
              <Outlet />
            </main>
          </div>
        </TripItinerarySocketProvider>
      </TripChatSocketProvider>
    </div>
  );
}