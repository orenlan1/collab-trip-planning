import type { Request, Response, NextFunction } from "express";
import lodgingService from "../services/lodging-service";
import type { CreateLodgingInput, UpdateLodgingInput } from "../schemas/lodging-schema.js";


const addLodging = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const data: CreateLodgingInput = req.body;
    try {
        const lodging = await lodgingService.create(data, tripId);
        res.status(201).json(lodging);
    } catch (error) {
        next(error);
    }
};

const getLodgings = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const lodgings = await lodgingService.getByTripId(tripId);
        res.status(200).json(lodgings);
    } catch (error) {
        next(error);
    }
};

const updateLodging = async (req: Request, res: Response, next: NextFunction) => {
    const lodgingId = req.params.lodgingId!;
    const data: UpdateLodgingInput = req.body;
    try {
        const lodging = await lodgingService.update(lodgingId, data);
        res.status(200).json(lodging);
    } catch (error) {
        next(error);
    }
};

const deleteLodging = async (req: Request, res: Response, next: NextFunction) => {
    const lodgingId = req.params.lodgingId!;
    try {
        await lodgingService.delete(lodgingId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export default {
    addLodging,
    getLodgings,
    updateLodging,
    deleteLodging
};
