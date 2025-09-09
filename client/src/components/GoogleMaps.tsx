import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

export const GoogleMaps = () => {
    const center = { lat: 37.8268, lng: -122.4231 };
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <div style={{ width: '100%', height: '400px', position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            {apiKey ? (
                <Map
                    defaultCenter={center}
                    defaultZoom={13}
                    mapId="8f112ffd2b5e89bd"
                    gestureHandling="greedy"
                    fullscreenControl={true}
                >
                    <AdvancedMarker position={center}>
                        <Pin />
                    </AdvancedMarker>
                </Map>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                    <p>Google Maps API key is missing</p>
                </div>
            )}
        </div>
    );
};
