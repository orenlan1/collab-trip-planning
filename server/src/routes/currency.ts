import express from 'express';
import { getCurrencies } from '../controllers/currency-controller.js';

const router = express.Router();

// GET /api/currencies - Get all available currencies
router.get(
    "/currencies",
    getCurrencies
);

export default router;
