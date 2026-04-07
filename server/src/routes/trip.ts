import express from 'express';
import { isAuthenticated, isTripMember, isTripOwner } from '../middleware/auth';
import validateResource from '../middleware/validateResource.js';
import { createTripSchema, updateTripSchema } from '../schemas/trip-schema.js';
import tripController from '../controllers/trip-controller.js'
import itineraryRoutes from './itinerary.js';
import flightRoutes from './flight.js';
import lodgingRoutes from './lodging.js';
import messageRoutes from './message.js';
import budgetRoutes from './budget.js';

const router = express.Router();


router.post("/", isAuthenticated, validateResource(createTripSchema), tripController.createTrip);
router.get("/", isAuthenticated, tripController.getUserTrips);
router.get("/newest", isAuthenticated, tripController.getNewestTripsByUserId);
router.get("/:id", isAuthenticated, tripController.getTripDetails);
router.patch("/:id", isAuthenticated, isTripMember, validateResource(updateTripSchema), tripController.updateTrip);
router.delete("/:id", isAuthenticated, isTripOwner, tripController.deleteTrip);
router.post("/:id/invite", isAuthenticated, tripController.inviteUserToTrip);

// Nest sub-resources under /:tripId
router.use("/:tripId/itinerary", itineraryRoutes);
router.use("/:tripId/flights", flightRoutes);
router.use("/:tripId/lodgings", lodgingRoutes);
router.use("/:tripId/messages", messageRoutes);
router.use("/:tripId/budget", budgetRoutes);

export default router;