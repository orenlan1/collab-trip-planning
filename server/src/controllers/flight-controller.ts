import type { Request, Response } from "express";
import flightService from "../services/flight-service";
import { searchFlightsOffers } from "../apiClients/amadeus/flights.js";

export interface FlightFormData {
    tripId: string;
    flightNumber: string;
    airline: string;
    departure: Date;
    arrival: Date;
    from: string;
    to: string;
}

const addFlight = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const data: FlightFormData = req.body;
    try {
        const flight = await flightService.create(data);
        res.status(201).json(flight);
    } catch (error) {
        res.status(500).json({ error: "Failed to add flight" });
    }
};

const getFlights = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripId } = req.params;

    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const flights = await flightService.getByTripId(tripId);
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch flights" });
    }
};

const updateFlight = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { flightId } = req.params;

    if (!flightId) {
        return res.status(400).json({ error: "Flight ID is required" });
    }

    const data: Partial<FlightFormData> = req.body;
    try {
        const flight = await flightService.update(flightId, data);
        res.status(200).json(flight);
    } catch (error) {
        res.status(500).json({ error: "Failed to update flight" });
    }
};

const deleteFlight = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { flightId } = req.params;

    if (!flightId) {
        return res.status(400).json({ error: "Flight ID is required" });
    }

    try {
        await flightService.delete(flightId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete flight" });
    }
};

export interface FlightSearchCriteria {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string | undefined;
  passengers: {
    adults: number;
    children: number;
  };
  tripType: 'oneWay' | 'roundTrip';
}

const searchFlights = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const data: FlightSearchCriteria = req.body;

    try {
        const results = await searchFlightsOffers(data);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to search flights" });
    }

};

export default {
    addFlight,
    getFlights,
    updateFlight,
    deleteFlight,
    searchFlights
};
