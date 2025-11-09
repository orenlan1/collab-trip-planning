import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import itineraryController from '../controllers/itinerary-controller';

const router = express.Router();

// Itinerary routes
router.get("/:itineraryId", isAuthenticated, itineraryController.getItinerary);
router.get("/:itineraryId/activities", isAuthenticated, itineraryController.getActivitiesForItinerary);

// Trip day routes
router.get("/days/:tripDayId", isAuthenticated, itineraryController.getTripDay);
router.post("/:itineraryId/days", isAuthenticated, itineraryController.addTripDay);
router.delete("/days/:tripDayId", isAuthenticated, itineraryController.deleteTripDay);

// Activity routes
router.get("/days/:tripDayId/activities", isAuthenticated, itineraryController.getActivities);
router.post("/days/:tripDayId/activities", isAuthenticated, itineraryController.addActivity);
router.patch("/activities/:activityId", isAuthenticated, itineraryController.updateActivity);
router.delete("/activities/:activityId", isAuthenticated, itineraryController.deleteActivity);

export default router;
