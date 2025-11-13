import type { Request, Response } from 'express';
import airportService from '../services/airport-service.js';

const searchAirports = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const airports = await airportService.search(query);
        res.json(airports);
    } catch (error: any) {
        console.error('Error searching airports:', error);
        res.status(500).json({ error: 'Failed to search airports' });
    }
};

export default {
    searchAirports
};
