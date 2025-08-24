import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import lodgingController from '../controllers/lodging-controller';

const router = express.Router();

router.post("/", isAuthenticated, lodgingController.addLodging);
router.get("/:tripId", isAuthenticated, lodgingController.getLodgings);
router.patch("/:lodgingId", isAuthenticated, lodgingController.updateLodging);
router.delete("/:lodgingId", isAuthenticated, lodgingController.deleteLodging);

export default router;
