import type { Request, Response } from "express";
export interface TripFormData {
    title: string;
    destination?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface TripUpdateData {
    title?: string;
    destination?: string;
    startDate?: Date;
    endDate?: Date;
}
declare const _default: {
    createTrip: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserTrips: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getTripDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTrip: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTrip: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=trip-controller.d.ts.map