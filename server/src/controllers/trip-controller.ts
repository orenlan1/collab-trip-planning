import type { Request, Response } from "express";
import type { TypedSocket } from "../types/socket";
import tripService from "../services/trip-service";



export interface TripFormData {
    title: string;
    destination?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
}

const createTrip = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const data: TripFormData = req.body;
  try {
    const trip = await tripService.create(data, req.user.id);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to create trip" });
  }
};

const getUserTrips = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const trips = await tripService.getAllTripsByUserId(req.user.id);
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips" });
    }
};

const getTripDetails = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    try {
        const trip = await tripService.getTripById(id);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        res.status(200).json(trip);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trip details" });
    }
};

export interface TripUpdateData {
    title?: string;
    destination?: string;
    startDate?: Date;
    endDate?: Date;
}

const updateTrip = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    const data : TripUpdateData = req.body;
    try {
        const updatedTrip = await tripService.update(id, data);
        res.status(200).json(updatedTrip);
    } catch (error) {
        res.status(500).json({ error: "Failed to update trip" });
    }
};

const deleteTrip = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    try {
        await tripService.deleteTripById(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete trip" });
    }
};


const inviteUserToTrip = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    const { email: invitedUserEmail } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    try {
        const invitation = await tripService.inviteUser(id, invitedUserEmail, req.user.id);
        
        // Get the socket instance
        // @ts-ignore - we'll add the io property to the request in index.ts
        const io = req.app.get('io');
        
        // Emit to the invited user's room
        io.to(`user:${invitation.invitedUserId}`).emit('invite:created', {
            tripId: invitation.tripId,
            inviterId: invitation.inviterUserId
        });

        res.status(200).json({ message: "User invited successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to invite user" });
    }
};

const getNewestTripsByUserId = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { limit } = req.query;
    try {
        const trips = await tripService.getNewestTripsMetadataByUserId(req.user.id, Number(limit) || 5);
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trips" });
    }
};

export default {
    createTrip,
    getUserTrips,
    getTripDetails,
    inviteUserToTrip,
    updateTrip,
    deleteTrip,
    getNewestTripsByUserId
}