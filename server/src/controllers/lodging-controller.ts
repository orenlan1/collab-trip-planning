import type { Request, Response } from "express";
import lodgingService from "../services/lodging-service";

export interface LodgingFormData {
    tripId: string;
    name: string;
    address: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
}

const addLodging = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const data: LodgingFormData = req.body;
    try {
        const lodging = await lodgingService.create(data);
        res.status(201).json(lodging);
    } catch (error) {
        res.status(500).json({ error: "Failed to add lodging" });
    }
};

const getLodgings = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripId } = req.params;

    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const lodgings = await lodgingService.getByTripId(tripId);
        res.status(200).json(lodgings);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch lodgings" });
    }
};

const updateLodging = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { lodgingId } = req.params;

    if (!lodgingId) {
        return res.status(400).json({ error: "Lodging ID is required" });
    }

    const data: Partial<LodgingFormData> = req.body;
    try {
        const lodging = await lodgingService.update(lodgingId, data);
        res.status(200).json(lodging);
    } catch (error) {
        res.status(500).json({ error: "Failed to update lodging" });
    }
};

const deleteLodging = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { lodgingId } = req.params;

    if (!lodgingId) {
        return res.status(400).json({ error: "Lodging ID is required" });
    }

    try {
        await lodgingService.delete(lodgingId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete lodging" });
    }
};

export default {
    addLodging,
    getLodgings,
    updateLodging,
    deleteLodging
};
