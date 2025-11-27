import type { Request, Response } from "express";
import itineraryService from "../services/itinerary-service";

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
    const { itineraryId } = req.params;

    if (!itineraryId) {
        return res.status(400).json({ error: "Itinerary ID is required" });
    }
    try {
        const itinerary = await itineraryService.getById(itineraryId);
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
    const { itineraryId } = req.params;
    if (!itineraryId) {
        return res.status(400).json({ error: "Itinerary ID is required" });
    }

    const data: TripDayFormData = req.body;
    try {
        const tripDay = await itineraryService.addTripDay(itineraryId, data);
        res.status(201).json(tripDay);
    } catch (error) {
        res.status(500).json({ error: "Failed to add trip day" });
    }
};

const addActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { tripDayId } = req.params;
    if (!tripDayId) {
        return res.status(400).json({ error: "Trip Day ID is required" });
    }

    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.addActivity(tripDayId, data);
        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ error: "Failed to add activity" });
    }
};

const updateActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { activityId } = req.params;

    if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required" });
    }

    const data: ActivityFormData = req.body;
    try {
        const activity = await itineraryService.updateActivity(activityId, data);
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ error: "Failed to update activity" });
    }
};

const deleteActivity = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { activityId } = req.params;
    if (!activityId) {
        return res.status(400).json({ error: "Activity ID is required" });
    }

    try {
        await itineraryService.deleteActivity(activityId);
        res.status(204).send();
    } catch (error) {
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

const getActivitiesForItinerary = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { itineraryId } = req.params;
    if (!itineraryId) {
        return res.status(400).json({ error: "Itinerary ID is required" });
    }

    try {
        const activities = await itineraryService.getActivitiesByItinerary(itineraryId);
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch activities for itinerary" });
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
    getActivitiesForItinerary
};
