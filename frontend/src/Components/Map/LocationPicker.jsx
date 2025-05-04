import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { mapConfig } from '../../lib/map.config';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

const LocationMarker = ({ position, onLocationChange }) => {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    const handleClick = (e) => {
        onLocationChange(e.latlng);
    };

    useEffect(() => {
        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, handleClick]);

    return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation || null);

    const handleLocationChange = (latlng) => {
        setPosition([latlng.lat, latlng.lng]);
        onLocationSelect(`${latlng.lat},${latlng.lng}`);
    };

    return (
        <div className="map-container">
            <MapContainer
                center={position || mapConfig.defaultCenter}
                zoom={mapConfig.defaultZoom}
                style={{ height: '400px', width: '100%' }}
            >
                <TileLayer
                    url={mapConfig.tileLayer}
                    attribution={mapConfig.attribution}
                />
                <LocationMarker position={position} onLocationChange={handleLocationChange} />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;