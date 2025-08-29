import { IoAirplaneOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";


export function FlightsCard() {
  const navigate = useNavigate();

  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 shadow-sm">
      <div className="flex px-4 gap-3 items-center">
        <IoAirplaneOutline className="text-xl text-indigo-500" />
        <h1 className="font-semibold text-xl">Flights</h1>
      </div>
      
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="text-indigo-500 mb-4">
          <IoAirplaneOutline className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Flights Yet?</h3>
        <p className="text-gray-600 mb-6">
          It looks like you haven't added any flights for this trip. Let's get started!
        </p>
        <div className="flex gap-3">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
            Add Flight
          </button>
          <button onClick={() => navigate("/search/flights")} className="border-2 border-indigo-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">
            Search Flights
          </button>
        </div>
      </div>
    </div>
  );
}
