import dotenv from "dotenv";

dotenv.config();

interface PlaceLocation {
    latitude: number;
    longitude: number;
}

interface Place {
    displayName: {
        text: string;
        languageCode: string;
    };
    formattedAddress: string;
    location: PlaceLocation;
}

interface TextSearchResponse {
    places: Place[];
}

export async function getRestaurants(query: string, destination: string): Promise<Place[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY is not defined");
    }

    const url = "https://places.googleapis.com/v1/places:searchText";
    
    const requestBody = {
        textQuery: `${query}, ${destination}`,
        maxResultCount: 20
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
            "Referer": process.env.SERVER_URL || "http://localhost:3000"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Maps API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as TextSearchResponse;
    return data.places || [];
}