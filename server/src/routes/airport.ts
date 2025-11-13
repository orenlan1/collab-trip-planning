import { Router } from 'express';
import airportController from '../controllers/airport-controller.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// Search airports by query (name, city, iata code)
router.get('/search', isAuthenticated, airportController.searchAirports);

export default router;
