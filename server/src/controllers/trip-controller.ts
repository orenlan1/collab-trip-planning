import type { Request, Response, NextFunction } from "express";
import type { TypedSocket } from "../sockets/types";
import type { CreateTripInput, UpdateTripInput } from "../schemas/trip-schema.js";
import tripService from "../services/trip-service";
import userService from "../services/user-service";
import { NotFoundError } from "../errors/AppError.js";



export interface TripFormData {
    title: string;
    destination: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
}

const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  const data = req.body as CreateTripInput;
  try {
    const trip = await tripService.create(data, req.user!.id);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

const getUserTrips = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trips = await tripService.getAllTripsByUserId(req.user!.id);
        res.status(200).json(trips);
    } catch (error) {
        next(error);
    }
};

const getTripDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const trip = await tripService.getTripById(id);
        if (!trip) {
            throw new NotFoundError("Trip not found");
        }
        res.status(200).json(trip);
    } catch (error) {
        next(error);
    }
};

export interface TripUpdateData {
    title?: string;
    destination?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
}

const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const data: UpdateTripInput = req.body;
    try {
        const updatedTrip = await tripService.update(id, data);

        if (data.startDate !== undefined || data.endDate !== undefined) {
            try {
                const io = req.app.get('io');
                if (io) {
                    io.to(`trip:${id}`).emit('trip:datesUpdated', {
                        tripId: id,
                        startDate: updatedTrip.startDate ? (typeof updatedTrip.startDate === 'string' ? updatedTrip.startDate : updatedTrip.startDate.toISOString()) : null,
                        endDate: updatedTrip.endDate ? (typeof updatedTrip.endDate === 'string' ? updatedTrip.endDate : updatedTrip.endDate.toISOString()) : null,
                        updatedBy: {
                            id: req.user!.id,
                            name: req.user!.name
                        },
                        timestamp: new Date()
                    });
                }
            } catch (socketError) {
                console.error('Failed to emit trip:datesUpdated:', socketError);
            }
        }

        res.status(200).json(updatedTrip);
    } catch (error) {
        next(error);
    }
};

const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
        await tripService.deleteTripById(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


const inviteUserToTrip = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { email: invitedUserEmail } = req.body;
    try {
        const invitation = await tripService.inviteUser(id, invitedUserEmail, req.user!.id);

        const io = req.app.get('io');
        io.to(`user:${invitation.invitedUserId}`).emit('invite:created', {
            tripId: invitation.tripId,
            inviterId: invitation.inviterUserId
        });

        res.status(200).json({ message: "User invited successfully" });
    } catch (error) {
        next(error);
    }
};

const getNewestTripsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const { limit } = req.query;
    try {
        const trips = await tripService.getNewestTripsMetadataByUserId(req.user!.id, Number(limit) || 5);
        res.status(200).json(trips);
    } catch (error) {
        next(error);
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
