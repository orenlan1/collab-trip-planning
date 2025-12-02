import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type React from "react";
import { FaBed } from "react-icons/fa";

interface GoogleMapsProps {
    center?: { lat: number; lng: number };
    markers?: { lat: number; lng: number }[];
    pin?: React.ReactNode;
}

export const GoogleMaps = ({ center, markers, pin }: GoogleMapsProps) => {
    const defaultCenter = center || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            {apiKey ? (
                <Map
                    defaultCenter={ defaultCenter}
                    defaultZoom={12}
                    mapId="8f112ffd2b5e89bd"
                    gestureHandling="greedy"
                    fullscreenControl={true}
                    reuseMaps={true}
                >
                    {markers && markers.map((marker, index) => (
                        <AdvancedMarker
                            key={index}
                            position={marker}
                        >
                            { pin || <Pin />}
                        </AdvancedMarker>
                    ))}
                </Map>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                    <p>Google Maps API key is missing</p>
                </div>
            )}
        </div>
    );
};
