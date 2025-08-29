import { mockFlights } from './mockFlights';
import { FlightCard } from './FlightCard';

export function FlightResults() {
  return (
    <div className="mt-6 max-w-5xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Flights</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {mockFlights.map(flight => (
          <li key={flight.id}>
            <FlightCard flight={flight} />
          </li>
        ))}
      </ul>
    </div>
  );
}