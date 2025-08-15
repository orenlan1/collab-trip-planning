import { prisma } from '../prisma/client';
import userService from '../services/user-service';
const updateUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const data = req.body;
    try {
        const updatedUser = await userService.update(user, data);
        res.json({ "updated user": updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update user" });
    }
};
export default {
    updateUser
};
//# sourceMappingURL=user-controller.js.map