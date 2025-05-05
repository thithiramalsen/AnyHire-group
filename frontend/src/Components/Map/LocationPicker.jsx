import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { mapConfig } from '../../lib/map.config';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMarker = ({ position, onLocationChange }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);

    const handleClick = (e) => {
        const { lat, lng } = e.latlng;
        onLocationChange([lat, lng]);
    };

    useEffect(() => {
        map.on('click', handleClick);
        return () => {
            map.off('click', handleClick);
        };
    }, [map, handleClick]);

    return position ? (
        <Marker 
            position={position}
            icon={new L.Icon.Default()}
        />
    ) : null;
};

const LocationPicker = ({ onLocationSelect, initialLocation, selectedLocation }) => {
    const [position, setPosition] = useState(
        initialLocation ? [initialLocation.lat, initialLocation.lng] : null
    );

    // Update position when selectedLocation changes (from current location button)
    useEffect(() => {
        if (selectedLocation) {
            const [lat, lng] = selectedLocation.split(',').map(Number);
            setPosition([lat, lng]);
        }
    }, [selectedLocation]);

    const handleLocationChange = (newPosition) => {
        setPosition(newPosition);
        onLocationSelect(`${newPosition[0]},${newPosition[1]}`);
    };

    return (
        <div className="h-[400px] rounded-lg overflow-hidden">
            <MapContainer
                center={position || mapConfig.defaultCenter}
                zoom={position ? 16 : mapConfig.defaultZoom}
                className="h-full w-full"
            >
                <TileLayer
                    url={mapConfig.tileLayer}
                    attribution={mapConfig.attribution}
                />
                <LocationMarker 
                    position={position}
                    onLocationChange={handleLocationChange}
                />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;