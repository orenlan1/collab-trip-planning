import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import lodgingController from '../controllers/lodging-controller';
import validateResource from '../middleware/validateResource.js';
import { createLodgingSchema, updateLodgingSchema } from '../schemas/lodging-schema.js';

const router = express.Router();

router.post("/:tripId/lodgings", isAuthenticated, validateResource(createLodgingSchema), lodgingController.addLodging);
router.get("/:tripId/lodgings", isAuthenticated, lodgingController.getLodgings);
router.patch("/:tripId/lodgings/:lodgingId", isAuthenticated, validateResource(updateLodgingSchema), lodgingController.updateLodging);
router.delete("/:tripId/lodgings/:lodgingId", isAuthenticated, lodgingController.deleteLodging);

export default router;
