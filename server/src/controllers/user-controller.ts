import { prisma } from '../prisma/client'
import type { Request, Response } from 'express'
import userService from '../services/user-service';


interface UserUpdateData {
    name?: string;
    image?: string;
}

const updateUser = async (req : Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const data: UserUpdateData = req.body;
    try {
        const updatedUser = await userService.update(user, data);
        res.json({ "updated user": updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update user" });
    }
}

export default {
    updateUser
}
