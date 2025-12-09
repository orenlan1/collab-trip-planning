import type { Request, Response } from 'express';
import messageService from '../services/message-service.js';
import userService from '../services/user-service'

const getMessages = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const tripId = req.params.tripId;
    if (!tripId) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }

    if (!await userService.isMemberOfTheTrip(req.user.id, tripId)) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const messages = await messageService.getMessagesForTrip(tripId);
    res.json(messages);
};

const createMessage = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const tripId = req.params.tripId;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!tripId) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: "Message content cannot be empty" });
    }

    if (!await userService.isMemberOfTheTrip(req.user.id, tripId)) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const newMessage = await messageService.createMessage(tripId, senderId, content);
    const io = req.app.get('io');
    io.to(`trip:${tripId}`).emit('chat:newMessage', newMessage);
    res.status(201).json(newMessage);
};

export default { getMessages, createMessage };