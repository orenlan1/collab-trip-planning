import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import lodgingController from '../controllers/lodging-controller';
import validateResource from '../middleware/validateResource.js';
import { createLodgingSchema, updateLodgingSchema } from '../schemas/lodging-schema.js';

const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/lodgings
router.get("/", isAuthenticated, lodgingController.getLodgings);
router.post("/", isAuthenticated, validateResource(createLodgingSchema), lodgingController.addLodging);
router.patch("/:lodgingId", isAuthenticated, validateResource(updateLodgingSchema), lodgingController.updateLodging);
router.delete("/:lodgingId", isAuthenticated, lodgingController.deleteLodging);

export default router;
