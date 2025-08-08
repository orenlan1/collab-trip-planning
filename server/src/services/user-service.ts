import {prisma} from '../prisma/client.js';


interface UserUpdateData {
    name?: string;
    image?: string;
}

    const update = async (user: Express.User, data: UserUpdateData) => {
        try{
              const updatedUser : Express.User = await prisma.user.update({
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
}

export default {
    update
};