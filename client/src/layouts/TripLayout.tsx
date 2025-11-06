import { Navbar } from '../components/navigation/top/Navbar';
import { TripSidebar } from '../pages/trips/navigation/TripSidebar';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { TripSocketProvider } from '@/context/TripSocketContext';

export const notifySuccess = (message: string) => toast.success(message);

export function TripLayout() {
  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />
      <TripSocketProvider>
      <div className="flex relative">
        <TripSidebar />
        <main className="flex-1 w-full lg:max-w-[1200px] mx-auto py-8 px-4 lg:px-6 mt-16 lg:mt-0">
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
          />
          <Outlet />
        </main>
      </div>
    </TripSocketProvider>
    </div>
  );
}