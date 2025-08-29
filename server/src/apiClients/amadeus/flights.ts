import type { FlightSearchCriteria } from "../../controllers/flight-controller.js";
import { getAmadeusToken } from "./cache-token.js";
import axios from "axios";

export const searchFlightsOffers = async (criteria: FlightSearchCriteria) => {
    
    const token = await getAmadeusToken();
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${criteria.from}&destinationLocationCode=${criteria.to}&departureDate=${criteria.departDate}&returnDate=${criteria.returnDate}&adults=${criteria.passengers.adults}&children=${criteria.passengers.children}&max=5&currencyCode=USD&travelClass=ECONOMY&nonStop=false&includeAirlines=&excludeAirlines=&tripType=${criteria.tripType}&sources=GDS`;

    try {
        const response = await axios.get(
            url,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error searching flights:", error);
        throw error;
    }
};

