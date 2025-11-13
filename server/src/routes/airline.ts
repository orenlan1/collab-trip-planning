import { Router } from 'express';
import airlineController from '../controllers/airline-controller.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// Search airlines by query (name, alias, callsign)
router.get('/search', isAuthenticated, airlineController.searchAirlines);

export default router;
