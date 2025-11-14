import type { Request, Response } from 'express';
import { destinationService } from '../services/destination-service.js';

export async function searchDestinations(req: Request, res: Response) {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required and must be at least 2 characters' 
      });
    }

    const results = await destinationService.search(query);
    return res.json(results);
  } catch (error) {
    console.error('Error searching destinations:', error);
    return res.status(500).json({ error: 'Failed to search destinations' });
  }
}
