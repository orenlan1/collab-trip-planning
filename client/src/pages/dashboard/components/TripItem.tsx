import type { TripsMetadata } from './TripsList';
import { useNavigate } from 'react-router-dom';

function formatDateRange(startDate: Date | undefined, endDate: Date | undefined): string {
    if (!startDate || !endDate) return 'Dates not set';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    try {
        // Ensure we're working with Date objects
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        
        return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
    } catch (error) {
        console.error('Error formatting dates:', error);
        return 'Invalid dates';
    }
}

export function TripItem({ trip }: { trip: TripsMetadata }) {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/trips/${trip.id}`)} className='flex gap-3 hover:border-indigo-500 transition group bg-white/60 border-sky-100 border rounded-lg pt-3 pr-3 pb-3 pl-3 items-center'>
            <div className='w-14 h-14 overflow-hidden flex-shrink-0 rounded-md'>
                <img src={trip.image} alt={trip.title} className='w-full h-full object-cover' />
            </div>
            <div className='flex items-center justify-between'>
                <div>
                    <div className='truncate text-sm font-semibold text-slate-900'>
                        {trip.title}
                    </div>
                    <div className="text-xs text-slate-500">
                        {formatDateRange(trip.startDate, trip.endDate)}
                    </div>                
                </div>
            </div>
        </div>
    )
}