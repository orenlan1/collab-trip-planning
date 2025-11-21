import type { Request, Response } from 'express';
import { getAllCurrencies } from '../services/currency-service.js';

/**
 * Get all available currencies
 * GET /api/currencies
 */
export const getCurrencies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const currencies = getAllCurrencies();
    
    res.status(200).json({
      success: true,
      data: currencies,
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currencies',
    });
  }
};
