import { useState, useEffect } from "react";
import { GoInbox} from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { tripsApi } from "@/pages/trips/services/api";
import { EmptyTripsListState } from "./EmptyTripSListState";
import { TripItem } from "./TripItem";

export interface TripsMetadata {
  id: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  image?: string;
}


export function TripsList() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripsMetadata[]>([]);


  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await tripsApi.getNewest(3);
        setTrips(response.data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg tracking-tight font-semibold">
          My Trips
        </h3>
        <div className="text-xs text-slate-500">
          {trips.length} total
        </div>
      </div>

      {trips.length === 0 ? (<EmptyTripsListState />) : (
        <div >
          <ul className="space-y-3">
            {trips.map(trip => (
              <TripItem key={trip.id} trip={trip} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
