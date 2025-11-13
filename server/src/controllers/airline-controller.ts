import type { Request, Response } from 'express';
import airlineService from '../services/airline-service.js';

const searchAirlines = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const airlines = await airlineService.search(query);
        res.json(airlines);
    } catch (error: any) {
        console.error('Error searching airlines:', error);
        res.status(500).json({ error: 'Failed to search airlines' });
    }
};

export default {
    searchAirlines
};
