import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import itineraryController from '../controllers/itinerary-controller';

const router = express.Router();

// Itinerary routes
router.get("/:tripId", isAuthenticated, itineraryController.getItinerary);

// Trip day routes
router.post("/:itineraryId/days", isAuthenticated, itineraryController.addTripDay);
router.delete("/days/:tripDayId", isAuthenticated, itineraryController.deleteTripDay);

// Activity routes
router.post("/days/:tripDayId/activities", isAuthenticated, itineraryController.addActivity);
router.patch("/activities/:activityId", isAuthenticated, itineraryController.updateActivity);
router.delete("/activities/:activityId", isAuthenticated, itineraryController.deleteActivity);

export default router;
