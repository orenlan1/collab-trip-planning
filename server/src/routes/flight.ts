import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import flightController from '../controllers/flight-controller';

const router = express.Router();

router.post("/", isAuthenticated, flightController.addFlight);
router.get("/:tripId", isAuthenticated, flightController.getFlights);
router.patch("/:flightId", isAuthenticated, flightController.updateFlight);
router.delete("/:flightId", isAuthenticated, flightController.deleteFlight);

router.post("/search/:tripId", isAuthenticated, flightController.searchFlights);
export default router;
