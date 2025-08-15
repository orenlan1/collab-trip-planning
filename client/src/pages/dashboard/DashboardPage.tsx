
import { WelcomeCard } from './components/WelcomeCard';
import { TripsList } from './components/TripsList';

export function DashboardPage() {
  return (
    <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-2 gap-6">
      <div className="space-y-6 bg-white/80 border-sky-200 border h-40 rounded-2xl shadow-sm">
        <WelcomeCard/>
      </div>
      <div className="md:col-span-2 md:row-span-2 space-y-6 bg-white/80 border-sky-200 border rounded-2xl
      shadow-sm">
        Some content
      </div>
      <div className='rounded-2xl bg-white/80 border-sky-200 border shadow-sm'>
        <TripsList/>
      </div>
    </div>
   
  );
}
