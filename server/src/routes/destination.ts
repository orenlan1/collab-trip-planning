import { Router } from 'express';
import * as destinationController from '../controllers/destination-controller.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// Search destinations (cities and countries) by query
router.get('/search', isAuthenticated, destinationController.searchDestinations);

export default router;
