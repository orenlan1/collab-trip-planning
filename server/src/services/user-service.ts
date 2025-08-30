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


const isMemberOfTheTrip = async (userId: string, tripId: string) => {
    const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { members : true }
    });
    return trip?.members.some(member => member.userId === userId) ?? false;
};

export default {
    update,
    isMemberOfTheTrip
};