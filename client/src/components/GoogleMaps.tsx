import { Map, AdvancedMarker, Pin, AdvancedMarkerAnchorPoint } from "@vis.gl/react-google-maps";
import type React from "react";
import { FaBed } from "react-icons/fa";

interface GoogleMapsProps {
    center?: { lat: number; lng: number };
    markers?: { id: string; lat: number; lng: number; index?: number; hasTime?: boolean }[];
    pin?: React.ReactNode;
    hoveredMarkerId?: string;
}

export const GoogleMaps = ({ center, markers, pin, hoveredMarkerId }: GoogleMapsProps) => {
    const defaultCenter = center || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const CustomNumberedPin = ({ index, isHovered }: { index: number; isHovered: boolean }) => (
        <div
            style={{
                width: isHovered ? '48px' : '40px',
                height: isHovered ? '48px' : '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: isHovered ? '18px' : '16px',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease'
            }}
        >
            {index}
        </div>
    );

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {apiKey ? (
                <Map
                    defaultCenter={ defaultCenter}
                    defaultZoom={12}
                    mapId="8f112ffd2b5e89bd"
                    gestureHandling="greedy"
                    fullscreenControl={true}
                    reuseMaps={true}
                >
                    {markers && markers.map((marker) => {
                        const isHovered = hoveredMarkerId === marker.id;
                        return (
                            <AdvancedMarker
                                key={marker.id}
                                position={{ lat: marker.lat, lng: marker.lng }}
                                anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                            >
                                {pin ? pin : marker.hasTime ? (
                                    <CustomNumberedPin index={marker.index!} isHovered={isHovered} />
                                ) : (
                                    <Pin scale={isHovered ? 1.5 : 1} background="#9ca3af" borderColor="#6b7280" glyphColor="#ffffff" />
                                )}
                            </AdvancedMarker>
                        );
                    })}
                </Map>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                    <p>Google Maps API key is missing</p>
                </div>
            )}
        </div>
    );
};
