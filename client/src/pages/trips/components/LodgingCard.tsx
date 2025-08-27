import { GoHome } from "react-icons/go";

export function LodgingCard() {
  return (
    <div className="border-1 rounded-xl py-3 bg-white/80 shadow-sm">
      <div className="flex px-4 gap-3 items-center">
        <GoHome className="text-xl text-indigo-500" />
        <h1 className="font-semibold text-xl">Lodging</h1>
      </div>
      
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="text-indigo-500 mb-4">
          <GoHome className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Lodging Booked?</h3>
        <p className="text-gray-600 mb-6">
          Looks like you haven't secured your stay. Find the perfect place to relax!
        </p>
        <div className="flex gap-3">
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold">
            Add Lodging
          </button>
          <button className="border-2 border-indigo-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">
            Search Lodging
          </button>
        </div>
      </div>
    </div>
  );
}
