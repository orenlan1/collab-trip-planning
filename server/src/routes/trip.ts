import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import tripController from '../controllers/trip-controller.js'

const router = express.Router();


router.post("/", isAuthenticated, tripController.createTrip);
router.get("/", isAuthenticated, tripController.getUserTrips);
router.get("/:id", isAuthenticated, tripController.getTripDetails);
router.patch("/:id", isAuthenticated, tripController.updateTrip);
router.delete("/:id", isAuthenticated, tripController.deleteTrip);



export default router;