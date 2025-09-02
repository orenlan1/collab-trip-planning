import { useTripStore } from "@/stores/tripStore";
import { FiMapPin } from "react-icons/fi";


export function DestinationCard() {
  const destination = useTripStore(state => state.destination);

  return (
    <div className="border-1 rounded-xl py-3 h-full bg-white/80 shadow-sm">
      <div className="flex px-4 gap-3 items-center">
        <FiMapPin className="text-xl text-indigo-500" />
        <h1 className="font-semibold text-xl">Destination</h1>
      </div>
      <div className="relative p-4">
        <FiMapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={destination ?? ""}
          className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm bg-white/90 border-neutral-200/60 border rounded-lg pt-3 pr-4 pb-3 pl-8"
          
        />
      </div>
      <div >
        <p className="ml-4 text-sm text-gray-500">country, region or city</p>
      </div>
      
      
        

    </div>
  );
}
