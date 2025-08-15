import tripService from "../services/trip-service";
const createTrip = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const data = req.body;
    try {
        const trip = await tripService.create(data, req.user.id);
        res.status(201).json(trip);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create trip" });
    }
};
const getUserTrips = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const trips = await tripService.getAllTripsByUserId(req.user.id);
        res.status(200).json(trips);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch trips" });
    }
};
const getTripDetails = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    try {
        const trip = await tripService.getTripById(id);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        res.status(200).json(trip);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch trip details" });
    }
};
const updateTrip = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    const data = req.body;
    try {
        const updatedTrip = await tripService.update(id, data);
        res.status(200).json(updatedTrip);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update trip" });
    }
};
const deleteTrip = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Invalid trip ID" });
    }
    try {
        await tripService.deleteTripById(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete trip" });
    }
};
export default {
    createTrip,
    getUserTrips,
    getTripDetails,
    updateTrip,
    deleteTrip
};
//# sourceMappingURL=trip-controller.js.map