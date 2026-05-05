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
    photos?: Array<{
        name: string;
        widthPx: number;
        heightPx: number;
    }>;
}

interface TextSearchResponse {
    places: Place[];
}

export interface ResolvedPlace {
    name:    string;
    address: string;
    lat:     number;
    lon:     number;
}

// Essentials-tier lookup: name + formattedAddress + location only (no photos).
export async function resolvePlaceByName(searchQuery: string): Promise<ResolvedPlace | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_MAPS_API_KEY is not defined');

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location',
            'Referer': process.env.SERVER_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({ textQuery: searchQuery, maxResultCount: 1 }),
    });

    if (!response.ok) return null;

    const data = await response.json() as TextSearchResponse;
    const place = data.places?.[0];
    if (!place) return null;

    return {
        name:    place.displayName.text,
        address: place.formattedAddress,
        lat:     place.location.latitude,
        lon:     place.location.longitude,
    };
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
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.photos",
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

export function getPlacePhotoUrl(photoName: string, maxWidth: number = 400): string {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY is not defined");
    }
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
}