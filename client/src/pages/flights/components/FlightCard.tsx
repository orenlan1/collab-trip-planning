import type { Flight } from './mockFlights';
import { FaPlane } from "react-icons/fa";

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const FlightRoute = ({ 
    from, 
    to, 
    departureTime, 
    arrivalTime, 
    duration,
    isReturn = false 
  }: { 
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    isReturn?: boolean;
  }) => (
    <div className="flex items-center justify-between mb-2">
      <div className="text-center flex-shrink-0">
        <p className="text-sm font-semibold">{departureTime}</p>
        <p className="text-xs text-gray-600">{isReturn ? to : from}</p>
      </div>

      <div className="flex-1 mx-2 relative">
        <div className="border-t-2 border-gray-300 relative top-3"></div>
        <div className="flex justify-center">
          <FaPlane className={`text-indigo-500 transform ${isReturn ? '-rotate-90' : 'rotate-90'} text-sm`} />
        </div>
        <p className="text-xs text-center text-gray-500">{duration}</p>
      </div>

      <div className="text-center flex-shrink-0">
        <p className="text-sm font-semibold">{arrivalTime}</p>
        <p className="text-xs text-gray-600">{isReturn ? from : to}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow max-w-md mx-auto">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{flight.airline}</h3>
        </div>
        <div className="text-lg font-bold text-indigo-600">
          ${flight.price}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Outbound · {flight.departDate}</p>
          <FlightRoute
            from={flight.from}
            to={flight.to}
            departureTime={flight.departureTime}
            arrivalTime={flight.arrivalTime}
            duration={flight.duration}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Return · {flight.returnDate}</p>
          <FlightRoute
            from={flight.from}
            to={flight.to}
            departureTime={flight.returnFlight.departureTime}
            arrivalTime={flight.returnFlight.arrivalTime}
            duration={flight.returnFlight.duration}
            isReturn={true}
          />
        </div>
      </div>

      <button className="w-full mt-3 bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition-colors text-sm">
        Select Flight
      </button>
    </div>
  );
}
