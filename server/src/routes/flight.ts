import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import flightController from '../controllers/flight-controller';
import { createFlightSchema, updateFlightSchema } from '../schemas/flight-schema';
import validateResource from '../middleware/validateResource';
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/flights
router.get("/", isAuthenticated, flightController.getFlights);
router.post("/", isAuthenticated, validateResource(createFlightSchema), flightController.addFlight);
router.patch("/:flightId", isAuthenticated, validateResource(updateFlightSchema), flightController.updateFlight);
router.delete("/:flightId", isAuthenticated, flightController.deleteFlight);

router.post("/search", isAuthenticated, flightController.searchFlights);
export default router;
