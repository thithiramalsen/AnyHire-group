import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import { mapConfig, parseLocationString } from '../../lib/map.config';
import { MapPinIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Add this new component for the center button functionality
const CenterButton = ({ position }) => {
    const map = useMap();
    
    const handleCenter = () => {
        map.setView([position.lat, position.lng], mapConfig.detailZoom);
    };

    return (
        <button
            onClick={handleCenter}
            className="absolute bottom-20 right-2 z-[1000] bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title="Center Map"
        >
            <MapPinIcon className="h-5 w-5 text-gray-600" />
        </button>
    );
};

const LocationDisplay = ({ location }) => {
    const position = parseLocationString(location);
    
    if (!position) return null;

    return (
        <div className="h-[300px] rounded-lg overflow-hidden mb-6 relative">
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={mapConfig.detailZoom}
                className="h-full w-full"
                zoomControl={false}
                dragging={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                touchZoom={true}
                keyboard={true}
            >
                <ZoomControl position="bottomright" />
                <CenterButton position={position} />
                <TileLayer
                    url={mapConfig.tileLayer}
                    attribution={mapConfig.attribution}
                />
                <Marker 
                    position={[position.lat, position.lng]}
                    icon={new L.Icon.Default()}
                />
            </MapContainer>
        </div>
    );
};

export default LocationDisplay;