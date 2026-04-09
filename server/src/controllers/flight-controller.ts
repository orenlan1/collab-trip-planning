import type { Request, Response, NextFunction } from "express";
import flightService from "../services/flight-service";
import type { CreateFlightInput, UpdateFlightInput } from "../schemas/flight-schema";

export interface FlightFormData {
    tripId: string;
    flightNumber: string;
    airline: string;
    departure: Date;
    arrival: Date;
    from: string;
    to: string;
}

const addFlight = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const data: CreateFlightInput = req.body;
    try {
        const flight = await flightService.create(tripId, data);
        res.status(201).json(flight);
    } catch (error) {
        next(error);
    }
};

const getFlights = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const flights = await flightService.getByTripId(tripId);
        res.status(200).json(flights);
    } catch (error) {
        next(error);
    }
};

const updateFlight = async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.flightId!;
    const data: UpdateFlightInput = req.body;
    try {
        const flight = await flightService.update(flightId, data);
        res.status(200).json(flight);
    } catch (error) {
        next(error);
    }
};

const deleteFlight = async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.flightId!;
    const tripId = req.params.tripId!;
    try {
        await flightService.delete(flightId, tripId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


export default {
    addFlight,
    getFlights,
    updateFlight,
    deleteFlight,
};
