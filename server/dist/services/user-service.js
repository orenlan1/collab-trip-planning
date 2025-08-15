import { prisma } from '../prisma/client.js';
const update = async (user, data) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.image !== undefined && { image: data.image }),
            },
            omit: {
                password: true, // Ensure password is not returned
            }
        });
        return updatedUser;
    }
    catch (error) {
        console.error('Error updating user:', error);
    }
};
export default {
    update
};
//# sourceMappingURL=user-service.js.map