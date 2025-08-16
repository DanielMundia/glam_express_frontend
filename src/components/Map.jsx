// components/Map.jsx
import React, { useEffect, useRef, useState } from 'react';
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const Map = ({ center, markers, directions }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    
    const containerStyle = {
        width: '100%',
        height: '400px'
    };
    
    const onLoad = (map) => {
        mapRef.current = map;
        setMap(map);
    };
    
    const onUnmount = () => {
        mapRef.current = null;
        setMap(null);
    };
    
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [center, map]);
    
    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {markers?.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        label={marker.label}
                        icon={marker.icon}
                    />
                ))}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScript>
    );
};

export default Map;

//    const Map = () => <div style={{ height: '400px', background: '#eee' }}>Map Placeholder</div>;
//    export default Map;
   