import { GoInbox} from "react-icons/go";

export function TripsList() {
  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h3 className="text-lg tracking-tight font-semibold">
          My Trips
        </h3>
        <div className="text-xs text-slate-500">
          0 total
        </div>
      </div>
      
      <div className="flex justify-center flex-col items-center gap-4">
        <div className="w-20 h-20 flex text-indigo-600 bg-indigo-50 rounded-lg items-center justify-center">
          <GoInbox size={35} />
        </div>
        <div className="text-sm font-semibold text-slate-900">
          You don't have any trips yet
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Create your first trip to start planning with friends.
        </div>
        <div>
          <button className="hover:bg-indigo-700 transition font-semibold text-white bg-indigo-600 rounded-md pt-2 pr-4 pb-2 pl-4">
            Create Trip
          </button>
        </div>

      </div>
    </div>
  );
}
