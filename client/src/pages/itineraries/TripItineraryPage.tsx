import { useTripStore } from "@/stores/tripStore"; 
import axios from "axios";
import { useEffect, useState } from "react";

export interface Itinerary {
  days: Array<{
    id: string;
    date: Date;
    activities: Array<{
      id: string;
      title: string;
        description?: string;
        startTime?: string;
        endTime?: string;
        location?: string;
        image?: string;
      }>
    }>
  
}


export function TripItineraryPage() {
  const itineraryId = useTripStore(state => state.itinerary.id);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        console.log("Fetching itinerary for ID:", itineraryId);
        const response = await axios.get(`http://localhost:3000/api/itineraries/${itineraryId}`, { withCredentials: true });
        console.log("Fetched itinerary data:", response.data);
        setItinerary(response.data);
      } catch (error) {
        console.error("Error fetching itinerary:", error);
      }
    };

    fetchItinerary();
  }, [itineraryId]);


  return (
    <div>
      <h1>Trip Itinerary</h1>
      {itinerary ? (
        <div>
          {itinerary.days.map((day) => (
            <div key={day.id}>
              <h2>{ new Date(day.date).toLocaleDateString()}</h2>
              <ul>
                {day.activities.map(activity => (
                  <li key={activity.id}>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                    {activity.startTime && <p>Start: {activity.startTime}</p>}
                    {activity.endTime && <p>End: {activity.endTime}</p>}
                    {activity.location && <p>Location: {activity.location}</p>}
                    {activity.image && <img src={activity.image} alt={activity.title} />}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading itinerary...</p>
      )}
    </div>
  );
}