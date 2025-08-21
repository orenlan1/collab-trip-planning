import React from "react";
import { GoInbox} from "react-icons/go";
import { useNavigate } from "react-router-dom";


export function EmptyTripsListState() {
  const navigate = useNavigate();
  
  return <div className="flex justify-center flex-col items-center gap-4">
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
          <button onClick={() => navigate("/trips/create")} className="hover:bg-indigo-700 transition font-semibold text-white bg-indigo-600 rounded-md pt-2 pr-4 pb-2 pl-4">
            Create Trip
          </button>
        </div>
      </div>;
}
  