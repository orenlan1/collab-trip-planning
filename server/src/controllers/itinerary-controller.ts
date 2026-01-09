import type { Request, Response } from "express";
import itineraryService from "../services/itinerary-service";
import type { TypedServer } from "../sockets/types";
import { getDiningSuggestions } from "../apiClients/openai/dining";

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


const getItinerary = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripId } = req.params;

    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }
    try {
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            return res.status(404).json({ error: "Itinerary not found" });
        }
        res.status(200).json(itinerary);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch itinerary" });
    }
};

const getTripDay = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripDayId } = req.params;

    if (!tripDayId) {
        return res.status(400).json({ error: "Trip Day ID is required" });
    }

    try {
        const tripDay = await itineraryService.getTripDay(tripDayId);
        if (!tripDay) {
            return res.status(404).json({ error: "Trip Day not found" });
        }
        res.status(200).json(tripDay);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trip day" });
    }
};

const addTripDay = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripId } = req.params;
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    const data: TripDayFormData = req.body;
    try {
        // First get the itinerary by tripId
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            return res.status(404).json({ error: "Itinerary not found" });
        }
        const tripDay = await itineraryService.addTripDay(itinerary.id, data);
        res.status(201).json(tripDay);
    } catch (error) {
        res.status(500).json({ error: "Failed to add trip day" });
    }
};

const addActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripDayId, tripId } = req.params;
    if (!tripDayId) {
        return res.status(400).json({ error: "Trip Day ID is required" });
    }

    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.addActivity(tripDayId, data);    
        const io : TypedServer = req.app.get('io');
        const socketData = {
           activity: activity,
           tripDayId: tripDayId,
           creatorId: req.user.id,
           creatorName: req.user.name,
        }
        io.to(`trip:${tripId}`).except(`user:${req.user.id}`).emit('activity:created', socketData);

        res.status(201).json(activity);
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ error: "Failed to add activity" });
    }
};

const updateActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { activityId, tripId } = req.params;

    if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required" });
    }

    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.updateActivity(activityId, data);
        
        const tripDay = await itineraryService.getTripDay(activity.tripDayId);
        
        const isDescriptionOnlyUpdate = Object.keys(data).length === 1 && data.description !== undefined;
        
        const io: TypedServer = req.app.get('io');
        const socketData = {
           activity: activity,
           tripDayId: activity.tripDayId,
           creatorId: req.user.id,
           creatorName: req.user.name,
           excludeNotification: isDescriptionOnlyUpdate,
        }
        io.to(`trip:${tripId}`).except(`user:${req.user.id}`).emit('activity:updated', socketData);
        
        res.status(200).json(activity);
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: "Failed to update activity" });
    }
};

const deleteActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { activityId, tripId } = req.params;
    if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required" });
    }

    try {
        const activity = await itineraryService.getActivityById(activityId);
        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }
        
        await itineraryService.deleteActivity(activityId);
        
        const io: TypedServer = req.app.get('io');
        const socketData = {
           activityId: activityId,
           tripDayId: activity.tripDayId,
           deletedById: req.user.id,
           deletedByName: req.user.name,
        }
        io.to(`trip:${tripId}`).except(`user:${req.user.id}`).emit('activity:deleted', socketData);
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ error: "Failed to delete activity" });
    }
};

const deleteTripDay = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripDayId } = req.params;

    if (!tripDayId) {
        return res.status(400).json({ error: "Trip Day ID is required" });
    }

    try {
        await itineraryService.deleteTripDay(tripDayId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete trip day" });
    }
};

const getActivities = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripDayId } = req.params;
    if (!tripDayId) {
        return res.status(400).json({ error: "Trip Day ID is required" });
    }

    try {
        const activities = await itineraryService.getActivities(tripDayId);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch activities" });
    }
};

const getAllActivities = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripId } = req.params;
    if (!tripId) {
        return res.status(400).json({ error: "Trip ID is required" });
    }

    try {
        const itinerary = await itineraryService.getByTripId(tripId);
        if (!itinerary) {
            return res.status(404).json({ error: "Itinerary not found" });
        }
        const activities = await itineraryService.getActivitiesByItinerary(itinerary.id);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch activities for itinerary" });
    }
};

const getDiningSuggestionsController = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { query, destination } = req.query;

    if (!query || !destination) {
        return res.status(400).json({ error: "Query and destination are required" });
    }

    try {
        const suggestions = await getDiningSuggestions(query as string, destination as string);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Failed to get dining suggestions:", error);
        res.status(500).json({ error: "Failed to get dining suggestions" });
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
