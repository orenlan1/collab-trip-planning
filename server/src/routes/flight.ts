import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import flightController from '../controllers/flight-controller';
import { createFlightSchema, updateFlightSchema } from '../schemas/flight-schema';
import validateResource from '../middleware/validateResource';
const router = express.Router();

router.post("/:tripId/flights", isAuthenticated, validateResource(createFlightSchema), flightController.addFlight);
router.get("/:tripId/flights", isAuthenticated, flightController.getFlights);
router.patch("/:tripId/flights/:flightId", isAuthenticated, validateResource(updateFlightSchema), flightController.updateFlight);
router.delete("/:tripId/flights/:flightId", isAuthenticated, flightController.deleteFlight);

router.post("/search/:tripId", isAuthenticated, flightController.searchFlights);
export default router;
