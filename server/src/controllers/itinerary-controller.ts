import type { Request, Response, NextFunction } from "express";
import itineraryService from "../services/itinerary-service";
import type { TypedServer } from "../sockets/types";
import { getDiningSuggestions } from "../apiClients/openai/dining";
import { NotFoundError } from "../errors/AppError.js";

export interface ItineraryFormData {
    tripId: string;
}

export interface TripDayFormData {
    date: Date;
}

export interface ActivityFormData {
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    name?: string;
    address?: string;
    image?: string;
    latitude?: number;
    longitude?: number;
}


const getItinerary = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            throw new NotFoundError("Itinerary not found");
        }
        res.status(200).json(itinerary);
    } catch (error) {
        next(error);
    }
};

const getTripDay = async (req: Request, res: Response, next: NextFunction) => {
    const tripDayId = req.params.tripDayId!;
    try {
        const tripDay = await itineraryService.getTripDay(tripDayId);
        if (!tripDay) {
            throw new NotFoundError("Trip Day not found");
        }
        res.status(200).json(tripDay);
    } catch (error) {
        next(error);
    }
};

const addTripDay = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    const data: TripDayFormData = req.body;
    try {
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            throw new NotFoundError("Itinerary not found");
        }
        const tripDay = await itineraryService.addTripDay(itinerary.id, data);
        res.status(201).json(tripDay);
    } catch (error) {
        next(error);
    }
};

const addActivity = async (req: Request, res: Response, next: NextFunction) => {
    const tripDayId = req.params.tripDayId!;
    const tripId = req.params.tripId!;
    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.addActivity(tripDayId, data);
        const io: TypedServer = req.app.get('io');
        io.to(`trip:${tripId}`).except(`user:${req.user!.id}`).emit('activity:created', {
           activity,
           tripDayId,
           creatorId: req.user!.id,
           creatorName: req.user!.name,
        });
        res.status(201).json(activity);
    } catch (error) {
        next(error);
    }
};

const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId!;
    const tripId = req.params.tripId!;
    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.updateActivity(activityId, data);
        const isDescriptionOnlyUpdate = Object.keys(data).length === 1 && data.description !== undefined;
        const io: TypedServer = req.app.get('io');
        io.to(`trip:${tripId}`).except(`user:${req.user!.id}`).emit('activity:updated', {
           activity,
           tripDayId: activity.tripDayId,
           creatorId: req.user!.id,
           creatorName: req.user!.name,
           excludeNotification: isDescriptionOnlyUpdate,
        });
        res.status(200).json(activity);
    } catch (error) {
        next(error);
    }
};

const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
    const activityId = req.params.activityId!;
    const tripId = req.params.tripId!;
    try {
        const activity = await itineraryService.getActivityById(activityId);
        if (!activity) {
            throw new NotFoundError("Activity not found");
        }
        await itineraryService.deleteActivity(activityId);
        const io: TypedServer = req.app.get('io');
        io.to(`trip:${tripId}`).except(`user:${req.user!.id}`).emit('activity:deleted', {
           activityId,
           tripDayId: activity.tripDayId,
           deletedById: req.user!.id,
           deletedByName: req.user!.name,
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const deleteTripDay = async (req: Request, res: Response, next: NextFunction) => {
    const tripDayId = req.params.tripDayId!;
    try {
        await itineraryService.deleteTripDay(tripDayId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const getActivities = async (req: Request, res: Response, next: NextFunction) => {
    const tripDayId = req.params.tripDayId!;
    try {
        const activities = await itineraryService.getActivities(tripDayId);
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
};

const getAllActivities = async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.tripId!;
    try {
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            throw new NotFoundError("Itinerary not found");
        }
        const activities = await itineraryService.getActivitiesByItinerary(itinerary.id);
        res.status(200).json(activities);
    } catch (error) {
        next(error);
    }
};

const getDiningSuggestionsController = async (req: Request, res: Response, next: NextFunction) => {
    const { query, destination } = req.query;
    try {
        const suggestions = await getDiningSuggestions(query as string, destination as string);
        res.status(200).json(suggestions);
    } catch (error) {
        next(error);
    }
};

export default {
    getItinerary,
    getTripDay,
    addTripDay,
    addActivity,
    updateActivity,
    deleteActivity,
    deleteTripDay,
    getActivities,
    getAllActivities,
    getDiningSuggestionsController
};
