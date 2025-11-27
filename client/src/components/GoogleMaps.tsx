import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type React from "react";


interface GoogleMapsProps {
    center?: { lat: number; lng: number };
    markers?: { lat: number; lng: number }[];
  
}

export const GoogleMaps = ({ center, markers }: GoogleMapsProps) => {
    const defaultCenter = center || { lat: 41.387397, lng: 2.1686 }; // Default to Barcelona
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            {apiKey ? (
                <Map
                    defaultCenter={ { lat: 41.387397, lng: 2.1686 }}
                    defaultZoom={13}
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
                            <Pin  />
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
