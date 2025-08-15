import type { TripFormData, TripUpdateData } from '../controllers/trip-controller.js';
declare const _default: {
    create: (data: TripFormData, creatorId: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        destination: string | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdById: string;
    }>;
    getAllTripsByUserId: (userId: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        destination: string | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdById: string;
    }[]>;
    getTripById: (id: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        destination: string | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdById: string;
    } | null>;
    update: (id: string, data: TripUpdateData) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        destination: string | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdById: string;
    }>;
    deleteTripById: (id: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        destination: string | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdById: string;
    }>;
};
export default _default;
//# sourceMappingURL=trip-service.d.ts.map