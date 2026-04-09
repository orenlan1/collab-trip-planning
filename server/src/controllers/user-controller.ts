import type { Request, Response, NextFunction } from 'express'
import userService from '../services/user-service';

interface UserUpdateData {
    name?: string;
    image?: string;
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const data: UserUpdateData = req.body;
    try {
        const updatedUser = await userService.update(req.user!, data);
        res.json({ "updated user": updatedUser });
    }
    catch (error) {
        next(error);
    }
}

export default {
    updateUser
}
